"use client";

import { useState, type FormEvent } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email") ?? "").trim().toLowerCase();
    const password = String(data.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    if (err) {
      setPending(false);
      setError(
        err.status === 429
          ? "Too many attempts. Please wait a minute and try again."
          : (err.status ?? 0) >= 500
            ? "Sign-in is unavailable because of a server problem. Please try again later."
            : "That email and password do not match an admin account.",
      );
      return;
    }
    // Full navigation so the new session cookie is sent with the first admin request.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load so the new session cookie is sent
    window.location.assign("/admin");
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 grid gap-4" noValidate>
      {error && (
        <p role="alert" className="rounded-xl bg-[#fef3f2] p-3 text-sm font-medium text-[#b42318] dark:bg-[#2d1512] dark:text-[#fda29b]">
          {error}
        </p>
      )}
      <label className="block">
        <span className="field-label">Email</span>
        <input name="email" type="email" autoComplete="username" required className="input" />
      </label>
      <label className="block">
        <span className="field-label">Password</span>
        <span className="relative block">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="input pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute inset-y-0 right-0 grid w-12 place-items-center rounded-r-xl text-ink-3 transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember"
          >
            {showPassword ? <EyeSlash size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
          </button>
        </span>
      </label>
      <button className="btn btn-primary mt-2 w-full" disabled={pending} aria-busy={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
