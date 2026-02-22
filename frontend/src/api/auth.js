import { apiRequest } from "./client";
import { API_PATHS } from "./config";

export const authApi = {
  login(credentials) {
    return apiRequest(API_PATHS.users.login, {
      method: "POST",
      auth: false,
      body: credentials,
    });
  },
};
