/**
 * Apply database migrations from ./drizzle.
 * Usage: npm run db:migrate   (uses DATABASE_URL)
 */
import "./env";
import { db, isNeonUrl } from "@/lib/db";


async function main() {
  const url = process.env.DATABASE_URL ?? "";
  if (isNeonUrl(url)) {
    const { migrate } = await import("drizzle-orm/neon-serverless/migrator");
    await migrate(db as never, { migrationsFolder: "./drizzle" });
  } else {
    const { migrate } = await import("drizzle-orm/node-postgres/migrator");
    await migrate(db as never, { migrationsFolder: "./drizzle" });
  }
  console.log("Migrations applied.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
