const TOKEN_STORAGE_KEY = "playto.auth.token";
const USER_STORAGE_KEY = "playto.auth.user";

let inMemoryToken = null;
let inMemoryUser = null;

const hasLocalStorage = () =>
  typeof window !== "undefined" && !!window.localStorage;

export const tokenStore = {
  getToken() {
    if (inMemoryToken) return inMemoryToken;
    if (!hasLocalStorage()) return null;
    const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) inMemoryToken = token;
    return token;
  },

  setToken(token) {
    inMemoryToken = token;
    if (hasLocalStorage()) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    }
  },

  clearToken() {
    inMemoryToken = null;
    if (hasLocalStorage()) {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  },

  getUser() {
    if (inMemoryUser) return inMemoryUser;
    if (!hasLocalStorage()) return null;
    const raw = window.localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return null;

    try {
      inMemoryUser = JSON.parse(raw);
      return inMemoryUser;
    } catch {
      return null;
    }
  },

  setUser(user) {
    inMemoryUser = user;
    if (hasLocalStorage()) {
      window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    }
  },

  clearUser() {
    inMemoryUser = null;
    if (hasLocalStorage()) {
      window.localStorage.removeItem(USER_STORAGE_KEY);
    }
  },
};

export function clearAuthStorage() {
  tokenStore.clearToken();
  tokenStore.clearUser();
}
