const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || "").trim();

if (import.meta.env.PROD && !rawApiBaseUrl) {
  throw new Error(
    "Missing VITE_API_BASE_URL. Set it in your deployment environment (for example, Vercel).",
  );
}

export const API_BASE_URL = (
  import.meta.env.DEV ? rawApiBaseUrl || "" : rawApiBaseUrl
).replace(/\/+$/, "");

if (import.meta.env.DEV) {
  // Helps verify where requests are going while debugging env issues.
  console.info(
    `[api] API_BASE_URL=${API_BASE_URL || "(empty -> Vite /api proxy is used)"}`,
  );
}

export const API_PATHS = {
  users: {
    create: "/api/users/create",
    list: "/api/users",
    login: "/api/users/login",
    karmaLeaderboard24h: "/api/users/leaderboard/karma-24h",
  },
  posts: {
    create: "/api/posts/create",
    list: "/api/posts",
    byId: (postId) => `/api/posts/${postId}`,
  },
  postLikes: {
    create: "/api/post-likes/create",
    deleteById: (likeId) => `/api/post-likes/${likeId}`,
  },
  comments: {
    create: "/api/comments/create",
    listByPost: (postId) => `/api/posts/${postId}/comments`,
  },
  commentLikes: {
    create: "/api/comment-likes/create",
    deleteById: (likeId) => `/api/comment-likes/${likeId}`,
  },
};
