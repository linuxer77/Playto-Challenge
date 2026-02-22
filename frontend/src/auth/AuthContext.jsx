import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  authApi,
  clearAuthStorage,
  subscribeUnauthorized,
  tokenStore,
  usersApi,
} from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => tokenStore.getToken());
  const [user, setUser] = useState(() => tokenStore.getUser());

  useEffect(() => {
    const unsubscribe = subscribeUnauthorized(() => {
      clearAuthStorage();
      setToken(null);
      setUser(null);
      navigate("/", { replace: true });
    });

    return unsubscribe;
  }, [navigate]);

  const value = useMemo(() => {
    const doLogin = async (credentials) => {
      const payload = await authApi.login(credentials);
      tokenStore.setToken(payload.token);
      tokenStore.setUser(payload.user);
      setToken(payload.token);
      setUser(payload.user);
      return payload;
    };

    return {
      isAuthenticated: Boolean(token),
      token,
      user,
      login: doLogin,
      async register(data) {
        await usersApi.create(data);
        return doLogin({ username: data.username, password: data.password });
      },
      logout() {
        clearAuthStorage();
        setToken(null);
        setUser(null);
      },
    };
  }, [token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
