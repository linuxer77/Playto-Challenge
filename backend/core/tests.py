from datetime import timedelta
from unittest.mock import patch

from django.db import IntegrityError, connection
from django.test import TestCase
from django.test.utils import CaptureQueriesContext
from django.utils import timezone
from rest_framework.test import APIClient

from api.views import _create_token_for_user
from core.models import Comment, CommentLike, Post, PostLike, User


class TechnicalConstraintsTests(TestCase):
	def setUp(self):
		self.viewer = self._create_user("viewer", "viewer@example.com")
		self.author = self._create_user("author", "author@example.com")

		self.client = APIClient()
		self.client.credentials(
			HTTP_AUTHORIZATION=f"Bearer {_create_token_for_user(self.viewer)}"
		)

	def _create_user(self, username, email):
		user = User(username=username, email=email)
		user.set_password("strongpassword123")
		user.save()
		return user

	def test_comments_endpoint_avoids_n_plus_one_for_deep_tree(self):
		post = Post.objects.create(author=self.author, title="T", content="C")

		parent = None
		for index in range(50):
			parent = Comment.objects.create(
				post=post,
				author=self.author,
				parent=parent,
				content=f"comment {index}",
			)
			CommentLike.objects.create(user=self.viewer, comment=parent)

		with CaptureQueriesContext(connection) as captured:
			response = self.client.get(f"/api/posts/{post.id}/comments")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(len(response.data), 1)
		self.assertLessEqual(
			len(captured),
			6,
			msg=f"Expected constant query count, got {len(captured)} queries.",
		)

	def test_like_creation_is_idempotent_under_repeated_requests(self):
		post = Post.objects.create(author=self.author, title="Like target", content="Body")

		first = self.client.post("/api/post-likes/create", {"post": post.id}, format="json")
		second = self.client.post("/api/post-likes/create", {"post": post.id}, format="json")

		self.assertEqual(first.status_code, 201)
		self.assertEqual(second.status_code, 200)
		self.assertEqual(PostLike.objects.filter(user=self.viewer, post=post).count(), 1)
		self.assertEqual(first.data["id"], second.data["id"])

	def test_like_creation_handles_integrity_error_race_path(self):
		post = Post.objects.create(author=self.author, title="Race", content="Body")
		existing = PostLike.objects.create(user=self.viewer, post=post)

		with patch(
			"api.views.PostLike.objects.get_or_create",
			side_effect=IntegrityError("simulated race"),
		):
			response = self.client.post(
				"/api/post-likes/create",
				{"post": post.id},
				format="json",
			)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["id"], existing.id)
		self.assertEqual(PostLike.objects.filter(user=self.viewer, post=post).count(), 1)

	def test_leaderboard_counts_only_last_24h_weighted_and_excludes_self_likes(self):
		alpha = self._create_user("alpha", "alpha@example.com")
		beta = self._create_user("beta", "beta@example.com")
		gamma = self._create_user("gamma", "gamma@example.com")

		alpha_post = Post.objects.create(author=alpha, title="alpha post", content="x")
		beta_post = Post.objects.create(author=beta, title="beta post", content="y")

		alpha_comment = Comment.objects.create(
			post=alpha_post,
			author=alpha,
			content="alpha comment",
		)
		beta_comment = Comment.objects.create(
			post=beta_post,
			author=beta,
			content="beta comment",
		)

		recent_post_like_for_alpha = PostLike.objects.create(user=beta, post=alpha_post)
		recent_comment_like_for_alpha = CommentLike.objects.create(
			user=gamma,
			comment=alpha_comment,
		)

		old_post_like_for_alpha = PostLike.objects.create(user=gamma, post=alpha_post)
		old_comment_like_for_beta = CommentLike.objects.create(
			user=alpha,
			comment=beta_comment,
		)
		self_like_for_beta = PostLike.objects.create(user=beta, post=beta_post)

		stale_time = timezone.now() - timedelta(hours=25)
		PostLike.objects.filter(id=old_post_like_for_alpha.id).update(created=stale_time)
		CommentLike.objects.filter(id=old_comment_like_for_beta.id).update(created=stale_time)

		# Keep these recent, explicit for clarity in case clock-sensitive environments differ.
		recent_time = timezone.now() - timedelta(hours=1)
		PostLike.objects.filter(id=recent_post_like_for_alpha.id).update(created=recent_time)
		CommentLike.objects.filter(id=recent_comment_like_for_alpha.id).update(
			created=recent_time
		)
		PostLike.objects.filter(id=self_like_for_beta.id).update(created=recent_time)

		response = self.client.get("/api/users/leaderboard/karma-24h")

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data["window_hours"], 24)

		top_users = response.data["top_users"]
		self.assertGreaterEqual(len(top_users), 1)

		alpha_row = next((row for row in top_users if row["username"] == "alpha"), None)
		self.assertIsNotNone(alpha_row)
		self.assertEqual(alpha_row["karma"], 6)  # 1 post-like * 5 + 1 comment-like * 1

		beta_row = next((row for row in top_users if row["username"] == "beta"), None)
		self.assertIsNone(beta_row)  # only old likes and self-like should not count
