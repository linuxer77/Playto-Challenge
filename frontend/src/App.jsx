import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AuthPage } from "./components/AuthPage";
import { Layout } from "./components/Layout";

export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          isAuthenticated ? <Navigate to="/home" replace /> : <AuthPage />
        }
      />

      <Route element={<RequireAuth />}>
        <Route path="/home" element={<Layout />} />
        <Route path="/posts/:postId" element={<Layout />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/home" : "/"} replace />}
      />
    </Routes>
  );
}
