// Always use relative API URLs in development so Vite proxy handles /api requests
// and avoids browser CORS/preflight issues.
export const API_BASE_URL = import.meta.env.DEV
  ? ""
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const API_PATHS = {
  users: {
    create: "/api/users/create",
    list: "/api/users",
    login: "/api/users/login",
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
