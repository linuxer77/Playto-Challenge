from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from core.models import User, Post, PostLike, Comment, CommentLike
from .serializers import (
    UserSerializer,
    PostSerializer,
    PostLikeSerializer,
    CommentCreateSerializer,
    CommentReadSerializer,
    CommentLikeSerializer,
)

# @api_view(["GET"])
# def getData(request):
#     User = Item.objects.all()
#     serializer = ItemSerializer(items, many=True)
#     return Response(serializer.data)
#

# @api_view(["POST"])
# def addItem(request):
#     serializer = ItemSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#     return Response(serializer.data)
#


@api_view(["POST"])
def createUser(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listUsers(request):
    users = User.objects.all().order_by("-created")
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createPost(request):
    serializer = PostSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listPosts(request):
    posts = Post.objects.all().order_by("-date")
    serializer = PostSerializer(posts, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["GET"])
def getPost(request, post_id):
    try:
        post = Post.objects.get(id=post_id)
    except Post.DoesNotExist:
        return Response({"detail": "Post not found."}, status=status.HTTP_404_NOT_FOUND)

    serializer = PostSerializer(post)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createPostLike(request):
    serializer = PostLikeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def deletePostLike(request, like_id):
    try:
        like = PostLike.objects.get(id=like_id)
    except PostLike.DoesNotExist:
        return Response(
            {"detail": "Post like not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    like.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
def createComment(request):
    serializer = CommentCreateSerializer(data=request.data)
    if serializer.is_valid():
        comment = serializer.save()
        response_serializer = CommentReadSerializer(comment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def listPostComments(request, post_id):
    comments = Comment.objects.filter(post_id=post_id, parent__isnull=True).order_by(
        "-created"
    )
    serializer = CommentReadSerializer(comments, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(["POST"])
def createCommentLike(request):
    serializer = CommentLikeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["DELETE"])
def deleteCommentLike(request, like_id):
    try:
        like = CommentLike.objects.get(id=like_id)
    except CommentLike.DoesNotExist:
        return Response(
            {"detail": "Comment like not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    like.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
