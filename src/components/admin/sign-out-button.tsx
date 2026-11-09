"use client";

import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  return (
    <button
      type="button"
      className="text-sm font-medium text-accent-text hover:underline"
      onClick={async () => {
        await authClient.signOut();
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- full load clears all signed-in state
        window.location.assign("/admin/login");
      }}
    >
      Sign out
    </button>
  );
}
