/** One-off: add the stock photos (scripts/seed-data.ts STOCK) to an existing database where their place is empty. */
import "./env";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { saveMedia } from "@/lib/media";
import { STOCK } from "./seed-data";

async function main() {
  for (const s of STOCK) {
    const taken = await db.select({ id: media.id }).from(media).where(eq(media.slot, s.slot));
    if (taken.length) { console.log(`${s.slot}: already has a photo, skipped`); continue; }
    const data = await readFile(path.join(process.cwd(), "assets_originals", "stock", s.file));
    await saveMedia({ data, filename: s.file, contentType: "image/jpeg", alt: s.alt, slot: s.slot });
    console.log(`${s.slot}: added`);
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
