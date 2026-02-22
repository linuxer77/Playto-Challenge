from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core import signing
from django.conf import settings
from django.db.models import Count, IntegerField, Value, Max, Q, OuterRef, Subquery
from django.utils import timezone
from datetime import timedelta
from django.db.models import F
from django.db import IntegrityError, transaction
from django.db.models.functions import Coalesce
from core.models import User, Post, PostLike, Comment, CommentLike
from .serializers import (
    UserSerializer,
    PostSerializer,
    PostLikeSerializer,
    CommentCreateSerializer,
    CommentReadSerializer,
    CommentLikeSerializer,
)

TOKEN_SALT = settings.TOKEN_SALT
TOKEN_MAX_AGE_SECONDS = settings.TOKEN_MAX_AGE_SECONDS


def _create_token_for_user(user):
    return signing.dumps({"user_id": user.id}, salt=TOKEN_SALT)


def _get_user_from_token(token):
    try:
        payload = signing.loads(token, salt=TOKEN_SALT, max_age=TOKEN_MAX_AGE_SECONDS)
    except signing.BadSignature:
        return None
    except signing.SignatureExpired:
        return None

    user_id = payload.get("user_id")
    if not user_id:
        return None

    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None


def _authenticate_request(request):
    auth_header = request.headers.get("Authorization", "")

    if not auth_header.startswith("Bearer "):
        return None, Response(
            {"detail": "Authentication credentials were not provided."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = auth_header.split(" ", 1)[1].strip()
    if not token:
        return None, Response(
            {"detail": "Invalid token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    user = _get_user_from_token(token)
    if not user:
        return None, Response(
            {"detail": "Invalid or expired token."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return user, None


@api_view(["POST"])
def createUser(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
def loginUser(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {"detail": "Username and password are required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return Response(
            {"detail": "Invalid credentials."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    token = _create_token_for_user(user)
    return Response(
        {
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
            },
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
def listUsers(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    users = User.objects.all().order_by("-created")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createPost(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    data = request.data.copy()
    data["author"] = auth_user.id

    serializer = PostSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listPosts(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    posts = Post.objects.all().order_by("-date")
    serializer = PostSerializer(posts, many=True, context={"auth_user": auth_user})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def getPost(request, post_id):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = PostSerializer(post, context={"auth_user": auth_user})
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createPostLike(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    data = request.data.copy()
    data["user"] = auth_user.id

    serializer = PostLikeSerializer(data=data)
    if serializer.is_valid():
        post = serializer.validated_data["post"]

        try:
            with transaction.atomic():
                like, created = PostLike.objects.get_or_create(user=auth_user, post=post)
        except IntegrityError:
            like = PostLike.objects.get(user=auth_user, post=post)
            created = False

        response_serializer = PostLikeSerializer(like)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def deletePostLike(request, like_id):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    try:
        like = PostLike.objects.get(id=like_id)
    except PostLike.DoesNotExist:
        return Response(
            {"detail": "Post like not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if like.user_id != auth_user.id:
        return Response(
            {"detail": "You do not have permission to delete this like."},
            status=status.HTTP_403_FORBIDDEN,
        )

    like.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def createComment(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    data = request.data.copy()
    data["author"] = auth_user.id

    serializer = CommentCreateSerializer(data=data)
    if serializer.is_valid():
        comment = serializer.save()
        response_serializer = CommentReadSerializer(
            comment,
            context={"auth_user": auth_user},
        )
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listPostComments(request, post_id):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    comments = list(
        Comment.objects.filter(post_id=post_id)
        .select_related("author")
        .annotate(
            comment_like_count=Count("commentlike", distinct=True),
            viewer_comment_like_id=Max(
                "commentlike__id",
                filter=Q(commentlike__user_id=auth_user.id),
            ),
        )
        .order_by("-created")
    )

    comments_by_id = {comment.id: comment for comment in comments}
    root_comments = []

    for comment in comments:
        comment.prefetched_replies = []

    for comment in comments:
        if comment.parent_id is None:
            root_comments.append(comment)
            continue

        parent_comment = comments_by_id.get(comment.parent_id)
        if parent_comment is not None:
            parent_comment.prefetched_replies.append(comment)

    serializer = CommentReadSerializer(
        root_comments,
        many=True,
        context={"auth_user": auth_user},
    )
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createCommentLike(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    data = request.data.copy()
    data["user"] = auth_user.id

    serializer = CommentLikeSerializer(data=data)
    if serializer.is_valid():
        comment = serializer.validated_data["comment"]

        try:
            with transaction.atomic():
                like, created = CommentLike.objects.get_or_create(
                    user=auth_user,
                    comment=comment,
                )
        except IntegrityError:
            like = CommentLike.objects.get(user=auth_user, comment=comment)
            created = False

        response_serializer = CommentLikeSerializer(like)
        return Response(
            response_serializer.data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def deleteCommentLike(request, like_id):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    try:
        like = CommentLike.objects.get(id=like_id)
    except CommentLike.DoesNotExist:
        return Response(
            {"detail": "Comment like not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if like.user_id != auth_user.id:
        return Response(
            {"detail": "You do not have permission to delete this like."},
            status=status.HTTP_403_FORBIDDEN,
        )

    like.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
def getKarmaLeaderboard24h(request):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    window_start = timezone.now() - timedelta(hours=24)

    post_karma_subquery = (
        PostLike.objects.filter(
            post__author_id=OuterRef("pk"),
            created__gte=window_start,
        )
        .exclude(user_id=OuterRef("pk"))
        .values("post__author_id")
        .annotate(
            total=Count("id") * Value(5, output_field=IntegerField()),
        )
        .values("total")[:1]
    )

    comment_karma_subquery = (
        CommentLike.objects.filter(
            comment__author_id=OuterRef("pk"),
            created__gte=window_start,
        )
        .exclude(user_id=OuterRef("pk"))
        .values("comment__author_id")
        .annotate(
            total=Count("id") * Value(1, output_field=IntegerField()),
        )
        .values("total")[:1]
    )

    top_users = list(
        User.objects.annotate(
            post_karma=Coalesce(
                Subquery(post_karma_subquery, output_field=IntegerField()),
                Value(0),
            ),
            comment_karma=Coalesce(
                Subquery(comment_karma_subquery, output_field=IntegerField()),
                Value(0),
            ),
        )
        .annotate(karma=F("post_karma") + F("comment_karma"))
        .filter(karma__gt=0)
        .order_by("-karma", "username")
        .values("id", "username", "karma")[:5]
    )

    leaderboard_rows = [
        {
            "user_id": row["id"],
            "username": row["username"],
            "karma": row["karma"],
        }
        for row in top_users
    ]

    return Response(
        {
            "window_hours": 24,
            "top_users": leaderboard_rows,
        },
        status=status.HTTP_200_OK,
    )
