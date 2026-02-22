import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const initialSignIn = { username: "", password: "" };
const initialSignUp = { username: "", email: "", password: "" };

export function AuthPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signInData, setSignInData] = useState(initialSignIn);
  const [signUpData, setSignUpData] = useState(initialSignUp);

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      if (mode === "signup") {
        await register(signUpData);
      } else {
        await login(signInData);
      }
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--tokyo-void)] px-4 py-4">
      <div className="terminal-shell w-full max-w-md p-0 text-[var(--tokyo-text)]">
        <div className="terminal-chrome px-4 py-2 text-xs tracking-[0.12em]">
          PLAYTO_AUTH://{mode.toUpperCase()}
        </div>
        <div className="p-5">
          <h1 className="text-xl font-bold tracking-[0.08em]">root@login</h1>
          <p className="mt-1 text-sm text-[var(--tokyo-muted)]">
            {mode === "signin" ? "authenticate user" : "create user session"}
          </p>

          <div className="mt-4 grid grid-cols-2 border border-[var(--tokyo-muted)]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError("");
              }}
              className={`terminal-action py-2 text-sm ${mode === "signin" ? "bg-[var(--tokyo-prompt)] text-[var(--tokyo-void)]" : "text-[var(--tokyo-text)]"}`}
            >
              sign_in
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`terminal-action border-l border-[var(--tokyo-muted)] py-2 text-sm ${mode === "signup" ? "bg-[var(--tokyo-prompt)] text-[var(--tokyo-void)]" : "text-[var(--tokyo-text)]"}`}
            >
              sign_up
            </button>
          </div>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <p className="terminal-prompt text-xs text-[var(--tokyo-muted)]">
              username
            </p>
            <input
              className="terminal-input w-full px-3 py-2 text-sm"
              placeholder="Username"
              autoComplete="username"
              value={
                mode === "signin" ? signInData.username : signUpData.username
              }
              onChange={(event) => {
                const { value } = event.target;
                if (mode === "signin")
                  setSignInData((p) => ({ ...p, username: value }));
                else setSignUpData((p) => ({ ...p, username: value }));
              }}
            />

            {mode === "signup" && (
              <>
                <p className="terminal-prompt text-xs text-[var(--tokyo-muted)]">
                  email
                </p>
                <input
                  className="terminal-input w-full px-3 py-2 text-sm"
                  placeholder="Email"
                  autoComplete="email"
                  value={signUpData.email}
                  onChange={(event) =>
                    setSignUpData((p) => ({ ...p, email: event.target.value }))
                  }
                />
              </>
            )}

            <p className="terminal-prompt text-xs text-[var(--tokyo-muted)]">
              password
            </p>
            <input
              className="terminal-input w-full px-3 py-2 text-sm"
              placeholder="Password"
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
              type="password"
              value={
                mode === "signin" ? signInData.password : signUpData.password
              }
              onChange={(event) => {
                const { value } = event.target;
                if (mode === "signin")
                  setSignInData((p) => ({ ...p, password: value }));
                else setSignUpData((p) => ({ ...p, password: value }));
              }}
            />

            {error && (
              <p className="border border-[var(--tokyo-alert)] bg-[var(--tokyo-surface)] px-3 py-2 text-sm text-[var(--tokyo-alert)]">
                error: {error}
              </p>
            )}

            <button
              type="submit"
              className="terminal-btn terminal-action w-full px-4 py-2.5 text-sm font-semibold text-[var(--tokyo-prompt)]"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "please wait..."
                : mode === "signin"
                  ? "> authenticate()"
                  : "> create_account()"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
