import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * File storage for uploads.
 * - With S3_BUCKET set: any S3-compatible bucket (Neon Object Storage, AWS S3, Cloudflare R2...).
 * - Without it (local development): files are written to .data/storage.
 *
 * Variables: S3_BUCKET, S3_ENDPOINT (omit for AWS), S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY,
 * S3_FORCE_PATH_STYLE ("true" for most non-AWS providers). AWS_* equivalents are used as fallbacks.
 */
const env = process.env;
// The bucket name defaults to "thegathering" when bucket keys are set but S3_BUCKET is not.
const bucket =
  env.S3_BUCKET || env.AWS_S3_BUCKET || ((env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3) && (env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID) ? "thegathering" : "");
const localRoot = path.join(process.cwd(), ".data", "storage");

let client: S3Client | null = null;
function s3(): S3Client {
  if (!client) {
    const endpoint = env.S3_ENDPOINT || env.AWS_ENDPOINT_URL_S3 || env.AWS_ENDPOINT_URL || undefined;
    const accessKeyId = env.S3_ACCESS_KEY_ID || env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = env.S3_SECRET_ACCESS_KEY || env.AWS_SECRET_ACCESS_KEY;
    client = new S3Client({
      region: env.S3_REGION || env.AWS_REGION || "us-east-1",
      endpoint,
      forcePathStyle: (env.S3_FORCE_PATH_STYLE ?? (endpoint ? "true" : "false")) === "true",
      credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey } : undefined,
    });
  }
  return client;
}

export const usingBucket = bucket !== "";

function safeLocalPath(key: string): string {
  const p = path.join(localRoot, key);
  if (!p.startsWith(localRoot + path.sep)) throw new Error("Invalid storage key");
  return p;
}

export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  if (usingBucket) {
    await s3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );
    return;
  }
  const file = safeLocalPath(key);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, body);
}

export async function getObject(key: string): Promise<{ body: Uint8Array; contentType?: string } | null> {
  try {
    if (usingBucket) {
      const res = await s3().send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      if (!res.Body) return null;
      return { body: await res.Body.transformToByteArray(), contentType: res.ContentType };
    }
    return { body: new Uint8Array(await readFile(safeLocalPath(key))) };
  } catch (err) {
    const e = err as { name?: string; code?: string; $metadata?: { httpStatusCode?: number } };
    if (e.name === "NoSuchKey" || e.code === "ENOENT" || e.$metadata?.httpStatusCode === 404) return null;
    throw err;
  }
}

export async function deleteObject(key: string): Promise<void> {
  if (usingBucket) {
    await s3().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return;
  }
  await rm(safeLocalPath(key), { force: true });
}
