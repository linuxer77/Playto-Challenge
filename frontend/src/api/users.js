import { apiRequest } from "./client";
import { API_PATHS } from "./config";

export const usersApi = {
  create(payload) {
    return apiRequest(API_PATHS.users.create, {
      method: "POST",
      auth: false,
      body: payload,
    });
  },

  list() {
    return apiRequest(API_PATHS.users.list, { method: "GET" });
  },

  getKarmaLeaderboard24h() {
    return apiRequest(API_PATHS.users.karmaLeaderboard24h, { method: "GET" });
  },
};
