import { apiRequest } from "./client";
import { API_PATHS } from "./config";

export const likesApi = {
  createPostLike(postId) {
    return apiRequest(API_PATHS.postLikes.create, {
      method: "POST",
      body: { post: postId },
    });
  },

  deletePostLike(likeId) {
    return apiRequest(API_PATHS.postLikes.deleteById(likeId), {
      method: "DELETE",
    });
  },

  createCommentLike(commentId) {
    return apiRequest(API_PATHS.commentLikes.create, {
      method: "POST",
      body: { comment: commentId },
    });
  },

  deleteCommentLike(likeId) {
    return apiRequest(API_PATHS.commentLikes.deleteById(likeId), {
      method: "DELETE",
    });
  },
};
