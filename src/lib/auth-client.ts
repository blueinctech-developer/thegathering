import { createAuthClient } from "better-auth/react";

/** Browser-side auth calls go through /api/auth (same origin). */
export const authClient = createAuthClient();
