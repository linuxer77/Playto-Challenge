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
    class Meta:
        model = Post
        fields = ["id", "author", "title", "content", "date"]
        read_only_fields = ["id", "date"]


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

    class Meta:
        model = Comment
        fields = ["id", "author", "content", "created", "replies"]

    def get_replies(self, obj):
        return CommentReadSerializer(
            obj.replies.all(),
            many=True,
            context=self.context,
        ).data


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
