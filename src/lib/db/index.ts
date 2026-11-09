import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import * as schema from "./schema";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

/**
 * Production: Neon (a DATABASE_URL on *.neon.tech) through Neon's serverless driver.
 * Any other Postgres URL uses node-postgres, e.g. the local development server
 * started with `npm run db:local` (postgresql://postgres@127.0.0.1:5433/postgres).
 */
export function isNeonUrl(url: string) {
  return /\.neon\.tech|\.neon\.build|neon\.database/.test(url);
}

function createDb(): DB {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    throw new Error("DATABASE_URL is not set. Locally, run `npm run db:local` and use the URL from .env.example.");
  }

  /* eslint-disable @typescript-eslint/no-require-imports */
  if (isNeonUrl(url)) {
    const { Pool, neonConfig } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
    const { drizzle } = require("drizzle-orm/neon-serverless") as typeof import("drizzle-orm/neon-serverless");
    if (typeof WebSocket === "undefined") neonConfig.webSocketConstructor = require("ws");
    return drizzle(new Pool({ connectionString: url }), { schema }) as unknown as DB;
  }

  const { Pool } = require("pg") as typeof import("pg");
  const { drizzle } = require("drizzle-orm/node-postgres") as typeof import("drizzle-orm/node-postgres");
  /* eslint-enable @typescript-eslint/no-require-imports */
  return drizzle(new Pool({ connectionString: url, max: 5 }), { schema }) as unknown as DB;
}

const globalForDb = globalThis as unknown as { __tgDb?: DB };

/** Created on first use, so builds and imports never need a live connection. */
export const db: DB = new Proxy({} as DB, {
  get(_t, prop) {
    globalForDb.__tgDb ??= createDb();
    const value = Reflect.get(globalForDb.__tgDb, prop);
    return typeof value === "function" ? value.bind(globalForDb.__tgDb) : value;
  },
});

export { schema };
