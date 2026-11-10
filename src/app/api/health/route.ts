import { connection } from "next/server";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { getObject, usingBucket } from "@/lib/storage";

function hostOf(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return "invalid";
  }
}

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
    endpointHost: hostOf(env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3 || env.AWS_ENDPOINT_URL),
    databaseHost: hostOf(env.DATABASE_URL),
    region: env.S3_REGION || env.AWS_REGION || null,
  };
  try {
    const { ListBucketsCommand, S3Client } = await import("@aws-sdk/client-s3");
    const endpoint = env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3;
    const accessKeyId = env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
    if (endpoint && accessKeyId && secretAccessKey) {
      const res = await new S3Client({ region: env.S3_REGION || env.AWS_REGION || "us-east-1", endpoint, forcePathStyle: true, credentials: { accessKeyId, secretAccessKey } }).send(new ListBucketsCommand({}));
      out.buckets = (res.Buckets ?? []).map((b) => b.Name);
    }
  } catch (err) {
    out.buckets = `error: ${(err as Error).name}`;
  }
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
