import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-band px-4 py-12">
      <div className="w-full max-w-sm">
        <Image src="/brand/the-gathering-logo.png" alt="The Gathering" width={635} height={320} className="mx-auto h-14 w-auto invert dark:invert-0" priority />
        <div className="card mt-8 p-6 sm:p-8">
          <h1 className="text-2xl">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">For The Gathering team only.</p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
