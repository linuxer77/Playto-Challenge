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
    <div className="flex min-h-screen items-center justify-center bg-[#04070C] px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/30 p-6 text-white">
        <h1 className="text-2xl font-bold">Playto</h1>
        <p className="mt-1 text-sm text-zinc-400">
          {mode === "signin" ? "Sign in to continue" : "Create an account"}
        </p>

        <div className="mt-4 grid grid-cols-2 rounded-lg bg-white/5 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("signin");
              setError("");
            }}
            className={`rounded-md py-2 text-sm ${mode === "signin" ? "bg-white text-black" : "text-zinc-300"}`}
          >
            Sign in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`rounded-md py-2 text-sm ${mode === "signup" ? "bg-white text-black" : "text-zinc-300"}`}
          >
            Sign up
          </button>
        </div>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
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
            <input
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
              placeholder="Email"
              autoComplete="email"
              value={signUpData.email}
              onChange={(event) =>
                setSignUpData((p) => ({ ...p, email: event.target.value }))
              }
            />
          )}

          <input
            className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm"
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
            <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-lg bg-[#1D9BF0] px-4 py-2.5 text-sm font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
}
