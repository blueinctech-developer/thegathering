"use client";

import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

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
      setError(err.status === 429 ? "Too many attempts. Please wait a minute and try again." : "That email and password do not match an admin account.");
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
        <input name="password" type="password" autoComplete="current-password" required className="input" />
      </label>
      <button className="btn btn-primary mt-2 w-full" disabled={pending} aria-busy={pending}>
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
