from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core import signing
from django.conf import settings
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
    serializer = PostSerializer(posts, many=True)
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

    serializer = PostSerializer(post)
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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
        response_serializer = CommentReadSerializer(comment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listPostComments(request, post_id):
    auth_user, auth_error = _authenticate_request(request)
    if auth_error:
        return auth_error

    comments = Comment.objects.filter(post_id=post_id, parent__isnull=True).order_by(
        "-created"
    )
    serializer = CommentReadSerializer(comments, many=True)
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
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

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
