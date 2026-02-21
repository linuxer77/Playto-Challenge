import { useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthPage } from "./components/AuthPage";
import { Layout } from "./components/Layout";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => window.localStorage.getItem("playto.auth") === "1",
  );

  const authActions = useMemo(
    () => ({
      signIn: () => {
        window.localStorage.setItem("playto.auth", "1");
        setIsAuthenticated(true);
      },
      signOut: () => {
        window.localStorage.removeItem("playto.auth");
        setIsAuthenticated(false);
      },
    }),
    [],
  );

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/home" replace />
          ) : (
            <AuthPage onAuthenticate={authActions.signIn} />
          )
        }
      />

      <Route
        path="/home"
        element={
          isAuthenticated ? (
            <Layout onSignOut={authActions.signOut} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="/:postId"
        element={
          isAuthenticated ? (
            <Layout onSignOut={authActions.signOut} />
          ) : (
            <Navigate to="/" replace />
          )
        }
      />

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
      />
    </Routes>
  );
}
