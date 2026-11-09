/** One-off: add the default questions and answers to an existing database that has none. */
import "./env";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { listItems } from "@/lib/db/schema";
import { FAQS } from "./seed-data";

async function main() {
  const existing = await db.select({ id: listItems.id }).from(listItems).where(eq(listItems.list, "faqs"));
  if (existing.length) {
    console.log("Questions and answers already exist.");
    process.exit(0);
  }
  await db.insert(listItems).values(FAQS.map((f, i) => ({ list: "faqs", title: f.title, body: f.body, sortOrder: (i + 1) * 10 })));
  console.log(`Added ${FAQS.length} questions and answers.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
