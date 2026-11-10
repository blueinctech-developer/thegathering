/**
 * First-deploy helper: creates the first admin from ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD,
 * but only when the database has no admins yet. Safe to run on every build.
 * After the first successful deploy, remove ADMIN_PASSWORD from the hosting settings.
 */
import "./env";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user } from "@/lib/db/schema";
import { createAdminUser } from "@/lib/users";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("bootstrap-admin: ADMIN_EMAIL/ADMIN_PASSWORD not set, skipped.");
    process.exit(0);
  }
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(user);
  if (n > 0) {
    console.log("bootstrap-admin: an admin already exists, skipped.");
    process.exit(0);
  }
  await createAdminUser({ name: process.env.ADMIN_NAME?.trim() || "Admin", email, password });
  console.log(`bootstrap-admin: created ${email}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
