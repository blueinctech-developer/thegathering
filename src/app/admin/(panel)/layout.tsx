import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/session";
import { SignOutButton } from "@/components/admin/sign-out-button";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

async function UserBadge() {
  const me = await requireAdmin();
  return (
    <div className="border-t border-line pt-4">
      <p className="truncate text-sm font-semibold">{me.name}</p>
      <p className="truncate text-xs text-muted">{me.email}</p>
      <div className="mt-3">
        <SignOutButton />
      </div>
    </div>
  );
}

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <Image src="/brand/the-gathering-logo.png" alt="" width={635} height={320} className="h-9 w-auto invert dark:invert-0" />
            <span className="text-sm font-semibold">Admin</span>
          </Link>
          <Link href="/" className="text-sm text-muted hover:text-ink" target="_blank">
            View site
          </Link>
        </div>
        <Suspense fallback={<div className="h-12 lg:h-96" />}>
          <AdminNav />
        </Suspense>
        <div className="hidden px-5 pb-6 lg:mt-auto lg:block">
          <Suspense fallback={<div className="h-20" />}>
            <UserBadge />
          </Suspense>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-8 sm:px-8 lg:px-12 lg:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
