import { useEffect } from "react";
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AuthPage } from "./components/AuthPage";
import { Layout } from "./components/Layout";

export default function App() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) return;

    const onHomeRoute = location.pathname === "/home";
    if (onHomeRoute) return;

    const navEntry =
      typeof window !== "undefined"
        ? window.performance
            ?.getEntriesByType?.("navigation")
            ?.find((entry) => entry.entryType === "navigation")
        : null;

    const isHardReload = navEntry?.type === "reload";
    if (isHardReload) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

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
