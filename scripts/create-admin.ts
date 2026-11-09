/**
 * Create an admin account.
 * Usage: npm run admin:create -- "Full Name" email@example.org
 * The password is read from ADMIN_PASSWORD, or a strong one is generated and printed once.
 */
import "./env";
import { randomBytes } from "node:crypto";
import { createAdminUser } from "@/lib/users";

async function main() {
  const [name, email] = process.argv.slice(2);
  if (!name || !email) {
    console.error('Usage: npm run admin:create -- "Full Name" email@example.org');
    process.exit(1);
  }
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD || randomBytes(12).toString("base64url");
  await createAdminUser({ name, email, password });
  console.log(`Admin created: ${email}`);
  if (generated) console.log(`Temporary password (shown once, change it after signing in): ${password}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
