import { apiRequest } from "./client";
import { API_PATHS } from "./config";

export const commentsApi = {
  create(payload) {
    return apiRequest(API_PATHS.comments.create, {
      method: "POST",
      body: payload,
    });
  },

  listByPost(postId) {
    return apiRequest(API_PATHS.comments.listByPost(postId), {
      method: "GET",
    });
  },
};
