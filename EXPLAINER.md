# EXPLAINER

## The Tree

I modeled nested comments using an adjacency-list pattern:

- `Comment.parent` is a nullable foreign key to `Comment` itself.
- Root comments have `parent = null`.
- Replies point to their parent comment.

In the read path, I avoided recursive database hits by loading all comments for a post in one query, then building the tree in memory:

- query all comments for the post
- `select_related("author")`
- annotate like metadata (`comment_like_count`, `viewer_comment_like_id`)
- attach each node to its parent using a dictionary (`comments_by_id`)

That gives us nested output with one main query, instead of N+1 queries while walking replies.

## The Math

This is the QuerySet used for the Last 24h leaderboard (`+5` per post like, `+1` per comment like, excluding self-likes):

```python
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

top_users = (
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
```

## The AI Audit

One concrete issue from an earlier AI-generated version:

- It recursively serialized replies with `obj.replies.all()` per node.
- It also computed like counts per node with extra queries.

That made comment listing degrade badly on larger threads (classic N+1 pattern).

How I fixed it:

1. Fetch all comments for the post in one query.
2. Annotate like counts and viewer-like id in that same query.
3. Build `prefetched_replies` in memory using parent/child IDs.
4. Make serializer read from `prefetched_replies` when available.

Result: dramatically fewer queries and stable performance as thread depth grows.
