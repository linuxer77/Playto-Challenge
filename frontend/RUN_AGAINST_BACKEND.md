# Run frontend against Django backend

## 1) Start backend

From backend folder:

- Install dependencies (if needed)
- Run migrations
- Start server at `http://localhost:8000`

Expected API root paths are mounted at backend root:

- `/api/users/create`
- `/api/users/login`
- `/api/users`
- `/api/posts/create`
- `/api/posts`
- `/api/posts/<id>`
- `/api/post-likes/create`
- `/api/post-likes/<id>`
- `/api/comments/create`
- `/api/posts/<id>/comments`
- `/api/comment-likes/create`
- `/api/comment-likes/<id>`

## 2) Configure frontend env

Create `.env.local` from `.env.example` and set:

- `VITE_API_BASE_URL=http://localhost:8000`

Notes:

- `VITE_API_BASE_URL` should always be an absolute URL.
- For Vercel, set `VITE_API_BASE_URL=https://<your-leapcell-domain>` in both Preview and Production environment variables.

## 3) Start frontend

From frontend folder:

- Install packages
- Run dev server

Frontend uses token auth and sends:

`Authorization: Bearer <token>`

If token is missing/expired and API returns 401/403, token is cleared and app redirects to login.

## 4) Run frontend integration tests

Run test script in frontend folder.
