# Views and URLs Completion Report

## What I implemented

### 1) Completed API logic in `api/views.py`

I added complete function-based API endpoints for the current models:

- Users:
  - `createUser` (POST)
  - `listUsers` (GET)
- Posts:
  - `createPost` (POST)
  - `listPosts` (GET)
  - `getPost` (GET by `post_id`)
- Post likes:
  - `createPostLike` (POST)
  - `deletePostLike` (DELETE by `like_id`)
- Comments:
  - `createComment` (POST)
  - `listPostComments` (GET root comments by `post_id`)
- Comment likes:
  - `createCommentLike` (POST)
  - `deleteCommentLike` (DELETE by `like_id`)

I also fixed imports in `views.py` so all required models and serializers are available.

### 2) Completed routing in `api/urls.py`

I added URL patterns for all implemented endpoints so they are reachable by the API.

## Why these changes were made

1. **Views were incomplete**
   - Previously only user creation and post creation were present.
   - A functional API needed read endpoints and like/comment endpoints to support the existing data model.

2. **Consistency with serializers and models**
   - Added endpoints that match the serializers already defined (`PostLikeSerializer`, `CommentCreateSerializer`, `CommentReadSerializer`, `CommentLikeSerializer`) and the models (`User`, `Post`, `PostLike`, `Comment`, `CommentLike`).

3. **Proper API behavior and status codes**
   - Used standard status codes (`201`, `200`, `204`, `400`, `404`) and explicit not-found handling for resource lookups.

4. **Nested comment output**
   - `createComment` returns `CommentReadSerializer` output so response shape is consistent with comment-read endpoints.

5. **Clear URL structure**
   - Added named routes with predictable endpoint patterns for easier frontend integration and maintenance.
