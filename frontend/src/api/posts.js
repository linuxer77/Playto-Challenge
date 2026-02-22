import { apiRequest } from "./client";
import { API_PATHS } from "./config";

export const postsApi = {
  create(payload) {
    return apiRequest(API_PATHS.posts.create, {
      method: "POST",
      body: payload,
    });
  },

  list() {
    return apiRequest(API_PATHS.posts.list, { method: "GET" });
  },

  get(postId) {
    return apiRequest(API_PATHS.posts.byId(postId), { method: "GET" });
  },
};
