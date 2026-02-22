# Technical Constraints Implementation (Line-by-Line)

This document explains every line that was implemented to satisfy:

1. N+1 comment tree query prevention
2. Like-button concurrency safety
3. Last-24-hours-only leaderboard aggregation

---

## 1) `api/serializers.py`

### A) `PostLikeSerializer` duplicate-check removal

- Removed the custom `validate()` block.
- Why: duplicate prevention is now handled atomically in the view with `get_or_create()` inside a transaction, which is race-condition safe.
- Effect: avoids pre-check race windows and avoids one extra query.

### B) `CommentReadSerializer.get_replies()`

Implemented lines:

- `prefetched_replies = getattr(obj, "prefetched_replies", None)`
  - Reads an in-memory children list attached in the view.
- `if prefetched_replies is not None:`
  - Uses prebuilt tree data when available.
- `replies = prefetched_replies`
  - No DB hit.
- `else:`
  - Fallback branch for old/non-optimized call paths.
- `replies = obj.replies.all()`
  - Keeps backward compatibility.
- Then serializer call now uses `replies` instead of `obj.replies.all()`.
  - This is the key N+1 fix for nested comments.

### C) `CommentReadSerializer.get_comment_like_count()`

Implemented lines:

- `annotated_count = getattr(obj, "comment_like_count", None)`
  - Reads SQL-annotated like-count value.
- `if annotated_count is not None:`
  - If the optimized query provided it, use it.
- `return annotated_count`
  - O(1), no extra query.
- `return obj.commentlike_set.count()`
  - Fallback for non-annotated contexts.

### D) `CommentReadSerializer.get_viewer_comment_like_id()`

Implemented lines:

- `annotated_like_id = getattr(obj, "viewer_comment_like_id", None)`
  - Reads SQL-annotated viewer-like id.
- `if annotated_like_id is not None:`
  - Uses one-query precomputed result.
- `return annotated_like_id`
  - Avoids per-comment lookup query.
- Existing fallback `CommentLike.objects.filter(...).first()` remains for compatibility.

### E) `CommentLikeSerializer` duplicate-check removal

- Removed custom `validate()` duplicate logic.
- Why: duplicate handling is moved to transactional `get_or_create()` in the view for race safety.

---

## 2) `api/views.py`

### A) Import changes

Implemented lines:

- Added `Max`, `Q`, `OuterRef`, `Subquery` from `django.db.models`.
  - Needed for annotated comment metadata and advanced leaderboard subqueries.
- Added `IntegrityError`, `transaction` from `django.db`.
  - Needed for atomic, concurrency-safe like creation.
- Added `Coalesce` from `django.db.models.functions`.
  - Needed to convert `NULL` subquery results to `0` in leaderboard math.

### B) `createPostLike()` concurrency-safe logic

Implemented lines:

- `post = serializer.validated_data["post"]`
  - Gets validated target post.
- `with transaction.atomic():`
  - Creates DB transaction boundary.
- `like, created = PostLike.objects.get_or_create(user=auth_user, post=post)`
  - Atomic insert-or-get behavior under unique constraint.
- `except IntegrityError:`
  - Handles race where another request inserted first.
- `like = PostLike.objects.get(user=auth_user, post=post)`
  - Loads winner row.
- `created = False`
  - Marks idempotent duplicate path.
- `response_serializer = PostLikeSerializer(like)`
  - Serializes canonical row.
- Return status line:
  - `201` if newly created; `200` if already existed.
  - Prevents flaky failures on rapid double-clicks.

### C) `listPostComments()` N+1 fix

Implemented lines:

- Built one query for the entire post tree:
  - `Comment.objects.filter(post_id=post_id)`
  - `.select_related("author")` (author joined once)
  - `.annotate(comment_like_count=Count("commentlike", distinct=True))`
  - `.annotate(viewer_comment_like_id=Max("commentlike__id", filter=Q(commentlike__user_id=auth_user.id)))`
  - `.order_by("-created")`
- Converted queryset to list once:
  - `comments = list(...)`
- `comments_by_id = {comment.id: comment for comment in comments}`
  - O(1) parent lookup map.
- `root_comments = []`
  - Stores top-level comments.
- First pass:
  - `comment.prefetched_replies = []` for all comments.
- Second pass:
  - If `parent_id is None`, append to `root_comments`.
  - Else append to `parent_comment.prefetched_replies`.
- Serializer now receives `root_comments`.
  - Nested replies are now entirely in-memory, preventing recursive query explosions.

### D) `createCommentLike()` concurrency-safe logic

Implemented lines mirror `createPostLike()`:

- Read validated `comment`.
- Wrap `CommentLike.objects.get_or_create(...)` in `transaction.atomic()`.
- Catch `IntegrityError`, fetch existing like, set `created = False`.
- Return serialized row with status `201` (created) or `200` (already exists).
- Result: race-safe, idempotent behavior for rapid click/tap bursts.

### E) `getKarmaLeaderboard24h()` strict 24h aggregation

Implemented lines:

- `window_start = timezone.now() - timedelta(hours=24)`
  - Defines strict rolling 24-hour boundary.

#### Post karma subquery

- Filters likes where:
  - post author equals outer user (`post__author_id=OuterRef("pk")`)
  - created in last 24h (`created__gte=window_start`)
  - excludes self-likes (`exclude(user_id=OuterRef("pk"))`)
- Aggregates weighted points:
  - `Count("id") * Value(5, output_field=IntegerField())`

#### Comment karma subquery

- Same 24h and self-like exclusion pattern for comments.
- Weight is `1` per comment-like.

#### Main leaderboard query

- Annotates each user with:
  - `post_karma = Coalesce(Subquery(...), Value(0))`
  - `comment_karma = Coalesce(Subquery(...), Value(0))`
- Computes `karma = F("post_karma") + F("comment_karma")`.
- Filters to users with positive karma only.
- Orders by highest karma, then username.
- Limits to top 5.
- Final reshaping maps `id` to API field `user_id`.

This ensures only karma earned in the last 24 hours is counted.

---

## 3) Behavioral Summary

- Comment tree load now uses one main comment query + in-memory tree assembly.
- Like creation for posts/comments is now race-safe and idempotent.
- Leaderboard computes weighted karma from exactly the last 24 hours via DB-level subqueries.
