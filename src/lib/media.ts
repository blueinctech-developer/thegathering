import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { media, type Media } from "@/lib/db/schema";
import { deleteObject, putObject } from "@/lib/storage";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const DOC_TYPES = ["application/pdf"];
export const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;

/** Named places on the site that show a chosen photo. */
export const MEDIA_SLOTS: { key: string; label: string }[] = [
  { key: "medical", label: "Medical outreach" },
  { key: "compassion", label: "Heart of Compassion" },
];

export function mediaUrl(m: Pick<Media, "key"> | null | undefined): string | null {
  return m ? `/media/${m.key}` : null;
}

/**
 * Store an uploaded file and record it. Photos are auto-rotated, capped at 2400px wide
 * and re-encoded as WebP so originals straight off a phone stay light.
 */
export async function saveMedia(input: {
  data: Buffer;
  filename: string;
  contentType: string;
  alt?: string;
  inGallery?: boolean;
  sortOrder?: number;
  slot?: string;
}): Promise<Media> {
  const { filename } = input;
  let { data, contentType } = input;
  let width: number | null = null;
  let height: number | null = null;
  let ext = filename.split(".").pop()?.toLowerCase() ?? "bin";

  if (IMAGE_TYPES.includes(contentType)) {
    const out = await sharp(data)
      .rotate()
      .resize({ width: 2400, withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    data = out.data;
    width = out.info.width;
    height = out.info.height;
    contentType = "image/webp";
    ext = "webp";
  } else if (!DOC_TYPES.includes(contentType)) {
    throw new Error("Unsupported file type");
  }

  const key = `uploads/${randomUUID()}.${ext}`;
  await putObject(key, data, contentType);
  const [row] = await db
    .insert(media)
    .values({
      key,
      filename,
      contentType,
      bytes: data.length,
      width,
      height,
      alt: input.alt ?? "",
      inGallery: input.inGallery ?? false,
      sortOrder: input.sortOrder ?? 0,
      slot: input.slot ?? "",
    })
    .returning();
  return row;
}

export async function removeMedia(id: number): Promise<void> {
  const [row] = await db.select().from(media).where(eq(media.id, id));
  if (!row) return;
  await db.delete(media).where(eq(media.id, id));
  await deleteObject(row.key).catch(() => undefined);
}
