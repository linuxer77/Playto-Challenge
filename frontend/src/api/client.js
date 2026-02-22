import { API_BASE_URL } from "./config";
import { clearAuthStorage, tokenStore } from "./tokenStore";

const unauthorizedListeners = new Set();

export function subscribeUnauthorized(listener) {
  unauthorizedListeners.add(listener);
  return () => unauthorizedListeners.delete(listener);
}

function notifyUnauthorized() {
  clearAuthStorage();
  for (const listener of unauthorizedListeners) {
    listener();
  }
}

function toApiError(status, details) {
  const message =
    details?.detail ||
    details?.message ||
    (typeof details === "string" ? details : "Request failed");

  const error = new Error(message);
  error.status = status;
  error.details = details;
  return error;
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, auth = true, headers = {}, signal } = options;
  const url = `${API_BASE_URL}${path}`;

  const requestHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (auth) {
    const token = tokenStore.getToken();
    if (token) {
      requestHeaders.Authorization = `Bearer ${token}`;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    const error = new Error(
      `Network request failed (${method} ${url}). Check backend is running and CORS/proxy configuration.`,
    );
    error.status = 0;
    error.details = null;
    throw error;
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      notifyUnauthorized();
    }
    throw toApiError(response.status, payload);
  }

  if (response.status === 204) {
    return null;
  }

  return payload;
}
