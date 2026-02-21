from rest_framework import serializers
from core.models import User, Post, PostLike, Comment, CommentLike


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ["username", "email", "created"]

    def create(self, validated_data):
        user = User(username=validated_data["username"], email=validated_data["email"])

        user.set_password(validated_data["password"])
        user.save()
        return user


class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fileds = "__all__"


class PostLikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PostLike
        fields = ["id", "post", "created"]
        read_only_fields = ["id", "created"]


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ["post", "parent", "content"]


class CommentReadSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_filed="username")
    replies = serializers.SerializerMethodField()

    class Meta:
        model = Comment
        fields = ["id", "author", "content", "created", "replies"]

    def get_replies(self, obj):
        return (
            CommentReadSerializer(obj.replies.all(), many=True).data
        )  # temp nested struct for now, im gonna fix it later on to solve n + 1 prob
