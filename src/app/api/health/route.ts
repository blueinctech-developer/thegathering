import { connection } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { getObject, usingBucket } from "@/lib/storage";

/** Quick check that the site can reach its database and file bucket. Reports yes/no only, never settings. */
export async function GET() {
  await connection();
  const env = process.env;
  const out: Record<string, unknown> = {
    bucketName: Boolean(env.S3_BUCKET),
    endpoint: Boolean(env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3 || env.AWS_ENDPOINT_URL),
    accessKey: Boolean(env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID),
    secretKey: Boolean(env.S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY),
    usingBucket,
  };
  try {
    const [row] = await db.select({ key: media.key }).from(media).limit(1);
    out.database = "ok";
    if (row) {
      try {
        const obj = await getObject(row.key);
        out.sampleFile = obj ? `ok (${obj.body.length} bytes)` : "not found";
      } catch (err) {
        out.sampleFile = `error: ${(err as Error).name}`;
      }
    }
  } catch (err) {
    out.database = `error: ${(err as Error).name}`;
  }
  return Response.json(out, { headers: { "Cache-Control": "no-store" } });
}
