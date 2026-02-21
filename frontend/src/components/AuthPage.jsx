import { useMemo, useState } from "react";
import { ArrowRight, AtSign, KeyRound, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const baseInputClass =
  "w-full rounded-xl border bg-black px-3.5 py-3 text-sm text-white placeholder:text-zinc-500 transition-all focus-visible:outline-none focus-visible:ring-2";

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function InputField({
  id,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-zinc-100">
        {label}
      </label>
      <div className="relative">
        <Icon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            baseInputClass,
            "pl-9",
            error
              ? "border-rose-400/70 focus-visible:border-rose-400 focus-visible:ring-rose-400/50"
              : "border-white/20 focus-visible:border-white/80 focus-visible:ring-white/40",
          )}
        />
      </div>
      <p
        id={`${id}-error`}
        className={cn(
          "mt-1.5 min-h-5 text-xs text-rose-300 transition-opacity",
          error ? "opacity-100" : "opacity-0",
        )}
      >
        {error || " "}
      </p>
    </div>
  );
}

export function AuthPage({ onAuthenticate }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState("signin");
  const [signInWithEmail, setSignInWithEmail] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [signInData, setSignInData] = useState({ username: "", email: "", password: "" });
  const [signUpData, setSignUpData] = useState({ username: "", email: "", password: "" });

  const cardTitle = useMemo(
    () => (mode === "signin" ? "Welcome back" : "Create your account"),
    [mode],
  );

  const submit = (event) => {
    event.preventDefault();

    const nextErrors = {};

    if (mode === "signup") {
      if (signUpData.username.trim().length < 3) {
        nextErrors.signUpUsername = "Username must be at least 3 characters.";
      }
      if (!validateEmail(signUpData.email)) {
        nextErrors.signUpEmail = "Enter a valid email address.";
      }
      if (signUpData.password.length < 8) {
        nextErrors.signUpPassword = "Password must be at least 8 characters.";
      }
    } else {
      if (signInWithEmail) {
        if (!validateEmail(signInData.email)) {
          nextErrors.signInEmail = "Enter a valid email address.";
        }
      } else if (signInData.username.trim().length < 3) {
        nextErrors.signInUsername = "Enter a valid username.";
      }

      if (signInData.password.length < 8) {
        nextErrors.signInPassword = "Password must be at least 8 characters.";
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    window.setTimeout(() => {
      onAuthenticate();
      navigate("/home", { replace: true });
      setIsSubmitting(false);
    }, 220);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-10 text-white sm:px-6 md:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-60 w-60 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-5xl items-center justify-center">
        <section className="grid w-full overflow-hidden rounded-3xl border border-white/15 bg-[#070707] shadow-2xl shadow-black/50 backdrop-blur-xl md:grid-cols-[1.15fr_1fr]">
          <aside className="hidden border-r border-white/10 bg-[#0A0A0A] p-8 md:flex md:flex-col md:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                Playto
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white">
                Build your community feed with confidence.
              </h1>
              <p className="mt-4 max-w-md text-sm text-zinc-300">
                A polished authentication flow with clean visuals, smart validation,
                and smooth transitions across every device.
              </p>
            </div>
            <p className="text-xs text-zinc-400">
              Secure, responsive, and production ready.
            </p>
          </aside>

          <div className="p-5 sm:p-7 md:p-8">
            <div className="mb-6 flex rounded-xl bg-[#111111] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setErrors({});
                }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all",
                  mode === "signin"
                    ? "bg-white text-black shadow"
                    : "text-zinc-300 hover:text-white",
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setErrors({});
                }}
                className={cn(
                  "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition-all",
                  mode === "signup"
                    ? "bg-white text-black shadow"
                    : "text-zinc-300 hover:text-white",
                )}
              >
                Sign Up
              </button>
            </div>

            <h2 className="text-2xl font-semibold text-white">{cardTitle}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {mode === "signin"
                ? "Sign in to continue to your home feed."
                : "Set up your profile and get started in seconds."}
            </p>

            <div className="relative mt-6 min-h-[340px] overflow-hidden">
              <form
                onSubmit={submit}
                className={cn(
                  "absolute inset-0 space-y-3 transition-all duration-300",
                  mode === "signin"
                    ? "translate-x-0 opacity-100"
                    : "-translate-x-8 opacity-0 pointer-events-none",
                )}
                noValidate
              >
                <div className="relative min-h-[88px]">
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      signInWithEmail
                        ? "translate-y-2 opacity-0 pointer-events-none"
                        : "translate-y-0 opacity-100",
                    )}
                  >
                    <InputField
                      id="signin-username"
                      label="Username"
                      placeholder="Enter username"
                      autoComplete="username"
                      value={signInData.username}
                      onChange={(event) =>
                        setSignInData((current) => ({
                          ...current,
                          username: event.target.value,
                        }))
                      }
                      error={errors.signInUsername}
                      icon={UserRound}
                    />
                  </div>

                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-300",
                      signInWithEmail
                        ? "translate-y-0 opacity-100"
                        : "-translate-y-2 opacity-0 pointer-events-none",
                    )}
                  >
                    <InputField
                      id="signin-email"
                      label="Email"
                      placeholder="you@example.com"
                      type="email"
                      autoComplete="email"
                      value={signInData.email}
                      onChange={(event) =>
                        setSignInData((current) => ({
                          ...current,
                          email: event.target.value,
                        }))
                      }
                      error={errors.signInEmail}
                      icon={AtSign}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSignInWithEmail((current) => !current);
                    setErrors((current) => ({
                      ...current,
                      signInEmail: undefined,
                      signInUsername: undefined,
                    }));
                  }}
                  className="-mt-0.5 inline-flex text-xs font-semibold text-zinc-300 transition-colors hover:text-white"
                >
                  {signInWithEmail
                    ? "Sign in with username instead"
                    : "Sign in with email instead"}
                </button>

                <InputField
                  id="signin-password"
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  autoComplete="current-password"
                  value={signInData.password}
                  onChange={(event) =>
                    setSignInData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  error={errors.signInPassword}
                  icon={KeyRound}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? "Signing In..." : "Sign In"}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </form>

              <form
                onSubmit={submit}
                className={cn(
                  "absolute inset-0 space-y-3 transition-all duration-300",
                  mode === "signup"
                    ? "translate-x-0 opacity-100"
                    : "translate-x-8 opacity-0 pointer-events-none",
                )}
                noValidate
              >
                <InputField
                  id="signup-username"
                  label="Username"
                  placeholder="Choose a username"
                  autoComplete="username"
                  value={signUpData.username}
                  onChange={(event) =>
                    setSignUpData((current) => ({
                      ...current,
                      username: event.target.value,
                    }))
                  }
                  error={errors.signUpUsername}
                  icon={UserRound}
                />

                <InputField
                  id="signup-email"
                  label="Email"
                  placeholder="you@example.com"
                  type="email"
                  autoComplete="email"
                  value={signUpData.email}
                  onChange={(event) =>
                    setSignUpData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  error={errors.signUpEmail}
                  icon={AtSign}
                />

                <InputField
                  id="signup-password"
                  label="Password"
                  placeholder="Create a password"
                  type="password"
                  autoComplete="new-password"
                  value={signUpData.password}
                  onChange={(event) =>
                    setSignUpData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  error={errors.signUpPassword}
                  icon={KeyRound}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition-all hover:bg-zinc-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-80"
                >
                  {isSubmitting ? "Creating Account..." : "Create Account"}
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
