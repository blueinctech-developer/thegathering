/**
 * Copy this computer's content to production: the site content tables from the local database
 * into Neon, and every uploaded file from .data/storage into the bucket.
 * Admin accounts and enquiries are not copied.
 *
 * Usage: fill .env.neon, then  npm run neon:push            (stops if Neon already has content)
 *                               npm run neon:push -- --force (replaces Neon's content)
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse } from "dotenv";
import { sql, type Table, getTableName } from "drizzle-orm";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { Pool as PgPool } from "pg";
import ws from "ws";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import * as schema from "@/lib/db/schema";

const TARGET_FILE = ".env.neon";
const ORDER: Table[] = [
  schema.media,
  schema.settings,
  schema.events,
  schema.speakers,
  schema.programmeDays,
  schema.programmeItems,
  schema.listItems,
  schema.fundingStreams,
];

function loadEnv(file: string) {
  if (!existsSync(file)) throw new Error(`${file} not found.`);
  return parse(readFileSync(file));
}

async function main() {
  const force = process.argv.includes("--force");
  const local = { ...(existsSync(".env") ? loadEnv(".env") : {}), ...(existsSync(".env.local") ? loadEnv(".env.local") : {}) };
  const target = loadEnv(TARGET_FILE);
  for (const k of ["DATABASE_URL", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_ENDPOINT_URL_S3", "S3_BUCKET"]) {
    if (!target[k]) throw new Error(`${k} is empty in ${TARGET_FILE}.`);
  }
  if (!local.DATABASE_URL) throw new Error("DATABASE_URL is missing from .env.local.");
  if (local.DATABASE_URL === target.DATABASE_URL) throw new Error("Local and Neon DATABASE_URL are the same.");

  console.log("1/3 Creating tables on Neon...");
  const mig = spawnSync("npx", ["tsx", "scripts/migrate.ts"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, DATABASE_URL: target.DATABASE_URL },
  });
  if (mig.status !== 0) throw new Error("Migration failed.");

  const src = drizzlePg(new PgPool({ connectionString: local.DATABASE_URL, max: 2 }), { schema });
  neonConfig.webSocketConstructor = ws;
  const neonPool = new NeonPool({ connectionString: target.DATABASE_URL });
  const dst = drizzleNeon(neonPool, { schema });

  const existing = await dst.select({ id: schema.events.id }).from(schema.events).limit(1);
  if (existing.length && !force) {
    console.log("Neon already has content. Run with --force to replace it.");
    await neonPool.end();
    process.exit(0);
  }

  console.log("2/3 Copying content...");
  const rows = new Map<Table, Record<string, unknown>[]>();
  for (const t of ORDER) rows.set(t, (await src.select().from(t)) as Record<string, unknown>[]);

  await dst.transaction(async (tx) => {
    for (const t of [...ORDER].reverse()) await tx.delete(t);
    for (const t of ORDER) {
      const list = rows.get(t)!;
      for (let i = 0; i < list.length; i += 200) await tx.insert(t).values(list.slice(i, i + 200));
      const name = getTableName(t);
      if (name !== "settings") {
        await tx.execute(
          sql.raw(`SELECT setval(pg_get_serial_sequence('"${name}"', 'id'), COALESCE((SELECT MAX(id) FROM "${name}"), 0) + 1, false)`),
        );
      }
      console.log(`   ${name}: ${list.length}`);
    }
  });

  console.log("3/3 Uploading files to the bucket...");
  const s3 = new S3Client({
    region: target.AWS_REGION || "us-east-1",
    endpoint: target.AWS_ENDPOINT_URL_S3,
    forcePathStyle: true,
    credentials: { accessKeyId: target.AWS_ACCESS_KEY_ID, secretAccessKey: target.AWS_SECRET_ACCESS_KEY },
  });
  const files = rows.get(schema.media)! as { key: string; contentType: string }[];
  let done = 0;
  for (const f of files) {
    const body = await readFile(path.join(process.cwd(), ".data", "storage", f.key));
    await s3.send(
      new PutObjectCommand({
        Bucket: target.S3_BUCKET,
        Key: f.key,
        Body: body,
        ContentType: f.contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    done++;
  }
  console.log(`   ${done} files uploaded.`);

  await neonPool.end();
  console.log("Done. Neon now has this computer's content and files.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
