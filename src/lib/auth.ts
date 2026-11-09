import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";
import { authSchema } from "@/lib/db/schema";

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || undefined;
const vercelUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined;

/**
 * Admin login. Email and password only; public sign-up is off, so accounts are created
 * by an existing admin (Admin > Account) or with `npm run admin:create`.
 */
export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [baseURL, vercelUrl].filter((v): v is string => Boolean(v)),
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
