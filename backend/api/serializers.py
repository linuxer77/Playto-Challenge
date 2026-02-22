from rest_framework import serializers
from core.models import User, Post, PostLike, Comment, CommentLike


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "created"]
        read_only_fields = ["id", "created"]

    def create(self, validated_data):
        user = User(username=validated_data["username"], email=validated_data["email"])

        user.set_password(validated_data["password"])
        user.save()
        return user


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.SlugRelatedField(read_only=True, slug_field="username", source="author")
    post_like_count = serializers.SerializerMethodField()
    thread_like_count = serializers.SerializerMethodField()
    total_like_count = serializers.SerializerMethodField()
    viewer_post_like_id = serializers.SerializerMethodField()
    is_liked_by_viewer = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "author_username",
            "title",
            "content",
            "date",
            "post_like_count",
            "thread_like_count",
            "total_like_count",
            "viewer_post_like_id",
            "is_liked_by_viewer",
        ]
        read_only_fields = ["id", "date"]

    def get_post_like_count(self, obj):
        return obj.postlike_set.count()

    def get_thread_like_count(self, obj):
        return CommentLike.objects.filter(comment__post=obj).count()

    def get_total_like_count(self, obj):
        return self.get_post_like_count(obj) + self.get_thread_like_count(obj)

    def get_viewer_post_like_id(self, obj):
        auth_user = self.context.get("auth_user")
        if not auth_user:
            return None

        like = PostLike.objects.filter(user=auth_user, post=obj).first()
        return like.id if like else None

    def get_is_liked_by_viewer(self, obj):
        return bool(self.get_viewer_post_like_id(obj))


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ["id", "user", "post", "created"]
        read_only_fields = ["id", "created"]

    def validate(self, attrs):
        user = attrs.get("user")
        post = attrs.get("post")

        if user and post and PostLike.objects.filter(user=user, post=post).exists():
            raise serializers.ValidationError("You have already liked this post.")

        return attrs


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["id", "post", "author", "parent", "content", "created"]
        read_only_fields = ["id", "created"]

    def validate(self, attrs):
        post = attrs.get("post")
        parent = attrs.get("parent")

        if parent and post and parent.post_id != post.id:
            raise serializers.ValidationError(
                "Parent comment must belong to the same post."
            )

        return attrs


class CommentReadSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")
    replies = serializers.SerializerMethodField()
    comment_like_count = serializers.SerializerMethodField()
    viewer_comment_like_id = serializers.SerializerMethodField()
    is_liked_by_viewer = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = [
            "id",
            "author",
            "content",
            "created",
            "comment_like_count",
            "viewer_comment_like_id",
            "is_liked_by_viewer",
            "replies",
        ]

    def get_replies(self, obj):
        return CommentReadSerializer(
            obj.replies.all(),
            many=True,
            context=self.context,
        ).data

    def get_comment_like_count(self, obj):
        return obj.commentlike_set.count()

    def get_viewer_comment_like_id(self, obj):
        auth_user = self.context.get("auth_user")
        if not auth_user:
            return None

        like = CommentLike.objects.filter(user=auth_user, comment=obj).first()
        return like.id if like else None

    def get_is_liked_by_viewer(self, obj):
        return bool(self.get_viewer_comment_like_id(obj))


class CommentLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CommentLike
        fields = ["id", "user", "comment", "created"]
        read_only_fields = ["id", "created"]

    def validate(self, attrs):
        user = attrs.get("user")
        comment = attrs.get("comment")

        if (
            user
            and comment
            and CommentLike.objects.filter(user=user, comment=comment).exists()
        ):
            raise serializers.ValidationError("You have already liked this comment.")

        return attrs
