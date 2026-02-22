from django.urls import path
from . import views


urlpatterns = [
    path("api/users/create", views.createUser, name="create-user"),
    path("api/users", views.listUsers, name="list-users"),
    path("api/posts/create", views.createPost, name="create-post"),
    path("api/posts", views.listPosts, name="list-posts"),
    path("api/posts/<int:post_id>", views.getPost, name="get-post"),
    path("api/post-likes/create", views.createPostLike, name="create-post-like"),
    path("api/post-likes/<int:like_id>", views.deletePostLike, name="delete-post-like"),
    path("api/comments/create", views.createComment, name="create-comment"),
    path("api/posts/<int:post_id>/comments", views.listPostComments, name="list-post-comments"),
    path("api/comment-likes/create", views.createCommentLike, name="create-comment-like"),
    path("api/comment-likes/<int:like_id>", views.deleteCommentLike, name="delete-comment-like"),
]
