import "server-only";
import { createHash } from "node:crypto";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { authSchema } from "@/lib/db/schema";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || undefined;
const vercelHosts = [process.env.VERCEL_URL, process.env.VERCEL_BRANCH_URL, process.env.VERCEL_PROJECT_PRODUCTION_URL]
  .filter(Boolean)
  .map((h) => `https://${h}`);

/**
 * Signing secret for login sessions. Uses BETTER_AUTH_SECRET when set; otherwise it is derived
 * from the private database connection string, so a missing setting cannot lock admins out.
 */
const secret =
  process.env.BETTER_AUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (process.env.DATABASE_URL
    ? createHash("sha256").update(`the-gathering-auth:${process.env.DATABASE_URL}`).digest("base64")
    : undefined);

/**
 * Admin login. Email and password only; public sign-up is off, so accounts are created
 * by an existing admin (Admin > Account) or with `npm run admin:create`.
 */
export const auth = betterAuth({
  baseURL,
  secret,
  trustedOrigins: [baseURL, ...vercelHosts].filter((v): v is string => Boolean(v)),
  database: drizzleAdapter(db, { provider: "pg", schema: authSchema }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
    minPasswordLength: 10,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  rateLimit: { enabled: true, window: 60, max: 30 },
  plugins: [nextCookies()],
});
