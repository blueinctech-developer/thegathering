import "server-only";
import { and, asc, eq, inArray } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "@/lib/db";
import {
  events,
  fundingStreams,
  listItems,
  media,
  programmeDays,
  programmeItems,
  settings,
  speakers,
  type Media,
} from "@/lib/db/schema";
import { parseSiteSettings } from "./site-settings";
import type { ListKey } from "./lists";

/** Every public read is tagged "content"; admin saves call updateTag(CONTENT_TAG). */
export const CONTENT_TAG = "content";

export type MediaRef = Pick<Media, "id" | "key" | "alt" | "width" | "height" | "contentType" | "filename" | "bytes">;

const mediaCols = {
  id: media.id,
  key: media.key,
  alt: media.alt,
  width: media.width,
  height: media.height,
  contentType: media.contentType,
  filename: media.filename,
  bytes: media.bytes,
};

async function mediaByIds(ids: (number | null | undefined)[]): Promise<Map<number, MediaRef>> {
  const wanted = [...new Set(ids.filter((v): v is number => typeof v === "number"))];
  if (!wanted.length) return new Map();
  const rows = await db.select(mediaCols).from(media).where(inArray(media.id, wanted));
  return new Map(rows.map((r) => [r.id, r]));
}

export async function getSite() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const [row] = await db.select().from(settings).where(eq(settings.key, "site"));
  return parseSiteSettings(row?.value);
}

export async function getEvent() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const [ev] = await db.select().from(events).where(eq(events.isCurrent, true)).orderBy(asc(events.id)).limit(1);
  if (!ev) return null;
  const m = await mediaByIds([ev.heroImageId, ev.flyerImageId, ev.busFlyerImageId, ev.overviewPdfId, ev.partnerHeroImageId]);
  return {
    ...ev,
    hero: ev.heroImageId ? (m.get(ev.heroImageId) ?? null) : null,
    flyer: ev.flyerImageId ? (m.get(ev.flyerImageId) ?? null) : null,
    busFlyer: ev.busFlyerImageId ? (m.get(ev.busFlyerImageId) ?? null) : null,
    overviewPdf: ev.overviewPdfId ? (m.get(ev.overviewPdfId) ?? null) : null,
    partnerHero: ev.partnerHeroImageId ? (m.get(ev.partnerHeroImageId) ?? null) : null,
  };
}
export type CurrentEvent = NonNullable<Awaited<ReturnType<typeof getEvent>>>;

export async function getList(list: ListKey) {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return db
    .select()
    .from(listItems)
    .where(and(eq(listItems.list, list), eq(listItems.published, true)))
    .orderBy(asc(listItems.sortOrder), asc(listItems.id));
}

export async function getSpeakers() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const rows = await db.select().from(speakers).where(eq(speakers.published, true)).orderBy(asc(speakers.sortOrder), asc(speakers.id));
  const m = await mediaByIds(rows.map((r) => r.photoId));
  return rows.map((r) => ({ ...r, photo: r.photoId ? (m.get(r.photoId) ?? null) : null }));
}

export async function getProgramme() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const days = await db.select().from(programmeDays).orderBy(asc(programmeDays.sortOrder), asc(programmeDays.day));
  if (!days.length) return [];
  const items = await db
    .select()
    .from(programmeItems)
    .where(inArray(programmeItems.dayId, days.map((d) => d.id)))
    .orderBy(asc(programmeItems.sortOrder), asc(programmeItems.id));
  return days.map((d) => ({ ...d, items: items.filter((i) => i.dayId === d.id) }));
}

export async function getFundingStreams() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  const rows = await db
    .select()
    .from(fundingStreams)
    .where(eq(fundingStreams.published, true))
    .orderBy(asc(fundingStreams.sortOrder), asc(fundingStreams.id));
  const m = await mediaByIds(rows.map((r) => r.documentId));
  return rows.map((r) => ({ ...r, document: r.documentId ? (m.get(r.documentId) ?? null) : null }));
}

export async function getGallery() {
  "use cache";
  cacheLife("max");
  cacheTag(CONTENT_TAG);
  return db
    .select(mediaCols)
    .from(media)
    .where(eq(media.inGallery, true))
    .orderBy(asc(media.sortOrder), asc(media.id));
}
