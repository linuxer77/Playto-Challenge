# Full Logic Explanation for views.py

This document explains all logic inside [api/views.py](api/views.py).

## Imports and setup

- Lines 1-5 import DRF response/status/decorator utilities, Django signing, and the required models.
- Lines 6-13 import all serializers used by the endpoints.
- Lines 16-17 define token settings:
  - signing salt
  - token max age (7 days)

## Token helper functions

### `_create_token_for_user`

- Builds a signed token with the payload containing only `user_id`.

### `_get_user_from_token`

- Verifies signature and expiry using Django signing.
- Returns `None` if token is tampered or expired.
- Reads `user_id` from payload.
- Returns `None` if payload is missing `user_id`.
- Queries database and returns matching user.
- Returns `None` if user no longer exists.

### `_authenticate_request`

- Reads `Authorization` header.
- Requires `Bearer <token>` format.
- Rejects missing/invalid/empty token with `401`.
- Decodes token with `_get_user_from_token`.
- Rejects invalid/expired tokens with `401`.
- On success returns `(user, None)`.

## Endpoint logic (full)

### `createUser` (POST)

- No auth required.
- Validates input through `UserSerializer`.
- Creates user on success and returns `201`.
- Returns serializer errors with `400` when invalid.

### `loginUser` (POST)

- No auth required.
- Requires both `username` and `password` in body.
- Returns `400` if either is missing.
- Looks up user by username.
- Returns `401` for unknown username.
- Validates password via `check_password`.
- Returns `401` for bad password.
- Creates signed token with `_create_token_for_user`.
- Returns `200` with:
  - token
  - basic user object (`id`, `username`, `email`)

### `listUsers` (GET)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches all users sorted by newest (`-created`).
- Returns serialized list with `200`.

### `createPost` (POST)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Copies request data and forces `author` to authenticated user.
- Validates with `PostSerializer`.
- Creates post and returns `201`.
- Returns validation errors with `400`.

### `listPosts` (GET)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches all posts sorted newest-first (`-date`).
- Returns serialized list with `200`.

### `getPost` (GET)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches post by `post_id`.
- Returns `404` if post does not exist.
- Returns serialized post with `200`.

### `createPostLike` (POST)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Copies request data and forces `user` to authenticated user.
- Validates with `PostLikeSerializer` (includes duplicate-like guard).
- Creates like and returns `201`.
- Returns validation errors with `400`.

### `deletePostLike` (DELETE)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches like by `like_id`.
- Returns `404` if not found.
- Verifies ownership (`like.user_id == auth_user.id`).
- Returns `403` if not owner.
- Deletes like and returns `204`.

### `createComment` (POST)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Copies request data and forces `author` to authenticated user.
- Validates with `CommentCreateSerializer`.
- Creates comment and returns `201`.
- Uses `CommentReadSerializer` in response for consistent output shape.
- Returns validation errors with `400`.

### `listPostComments` (GET)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches root comments for one post (`parent__isnull=True`) sorted newest-first.
- Serializes with `CommentReadSerializer` (includes nested replies).
- Returns `200`.

### `createCommentLike` (POST)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Copies request data and forces `user` to authenticated user.
- Validates with `CommentLikeSerializer` (includes duplicate-like guard).
- Creates comment like and returns `201`.
- Returns validation errors with `400`.

### `deleteCommentLike` (DELETE)

- Requires valid bearer token.
- Returns `401` if auth fails.
- Fetches comment-like by `like_id`.
- Returns `404` if not found.
- Verifies ownership (`like.user_id == auth_user.id`).
- Returns `403` if not owner.
- Deletes comment-like and returns `204`.

## Why this design is used

- Centralized authentication helper avoids duplicated auth parsing logic.
- Forced ownership on create operations prevents client-side author/user spoofing.
- Explicit ownership checks on delete operations prevent horizontal privilege escalation.
- Serializer-first validation keeps input rules in one consistent layer.
- Standard status codes keep API behavior predictable.
