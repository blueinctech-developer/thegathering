"use server";

import { and, asc, desc, eq, gt, lt, ne } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { fail, fd, ok, type ActionResult } from "@/lib/admin/form";
import { CONTENT_TAG } from "@/lib/content/queries";
import { listDef } from "@/lib/content/lists";
import { siteSettingsSchema } from "@/lib/content/site-settings";
import { db } from "@/lib/db";
import {
  account,
  enquiries,
  events,
  fundingStreams,
  listItems,
  media,
  programmeDays,
  programmeItems,
  settings,
  speakers,
  user,
} from "@/lib/db/schema";
import { DOC_TYPES, IMAGE_TYPES, MAX_UPLOAD_BYTES, removeMedia, saveMedia } from "@/lib/media";
import { createAdminUser, setAdminPassword } from "@/lib/users";
import { verifyPassword } from "better-auth/crypto";

/** After any content change: refresh the cached public pages and this admin view. */
function published() {
  updateTag(CONTENT_TAG);
  refresh();
}

async function storeUpload(file: File, opts: { alt?: string; inGallery?: boolean; docsAllowed?: boolean } = {}) {
  const allowed = opts.docsAllowed ? [...IMAGE_TYPES, ...DOC_TYPES] : IMAGE_TYPES;
  if (!allowed.includes(file.type)) throw new Error(`${file.name}: unsupported file type.`);
  if (file.size > MAX_UPLOAD_BYTES) throw new Error(`${file.name}: files must be under 15 MB.`);
  return saveMedia({
    data: Buffer.from(await file.arrayBuffer()),
    filename: file.name,
    contentType: file.type,
    alt: opts.alt,
    inGallery: opts.inGallery,
  });
}

/* ------------------------------------------------------------------ */
/* Site copy                                                           */
/* ------------------------------------------------------------------ */

export async function saveSettings(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const raw: Record<string, string> = {};
  for (const key of Object.keys(siteSettingsSchema.shape)) raw[key] = fd.str(data, key);
  const parsed = siteSettingsSchema.safeParse(raw);
  if (!parsed.success) return fail("Some fields could not be saved. Please check them and try again.");
  if (parsed.data.videoYoutubeId && !/^[A-Za-z0-9_-]{11}$/.test(parsed.data.videoYoutubeId)) {
    return fail("The YouTube video ID should be the 11-character code from the video link.");
  }
  await db
    .insert(settings)
    .values({ key: "site", value: parsed.data })
    .onConflictDoUpdate({ target: settings.key, set: { value: parsed.data, updatedAt: new Date() } });
  published();
  return ok("Site content saved and published.");
}

/* ------------------------------------------------------------------ */
/* Event                                                               */
/* ------------------------------------------------------------------ */

export async function saveEvent(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  // Inputs are wall-clock times in Lagos (UTC+1 all year).
  const lagos = (v: string) => new Date(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+01:00` : "invalid");
  const startsAt = lagos(fd.str(data, "startsAt"));
  const endsAt = lagos(fd.str(data, "endsAt"));
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return fail("Please enter valid start and end dates.");
  if (endsAt <= startsAt) return fail("The end date must be after the start date.");
  const name = fd.str(data, "name", 160);
  const theme = fd.str(data, "theme", 160);
  if (!name || !theme) return fail("Event name and theme are required.");

  try {
    const ids: Record<string, number | null> = {};
    for (const [field, label, docs] of [
      ["heroImageId", "hero photo", false],
      ["flyerImageId", "lineup flyer", false],
      ["busFlyerImageId", "bus flyer", false],
      ["overviewPdfId", "partnership overview", true],
      ["partnerHeroImageId", "partner page photo", false],
    ] as const) {
      const upload = fd.file(data, `${field}Upload`);
      if (upload) {
        const saved = await storeUpload(upload, { alt: `${name} ${label}`, docsAllowed: docs });
        ids[field] = saved.id;
      } else {
        ids[field] = fd.str(data, field) === "" ? null : fd.optId(data, field);
      }
    }

    const values = {
      name,
      theme,
      subtitle: fd.str(data, "subtitle", 160),
      summary: fd.str(data, "summary", 600),
      startsAt,
      endsAt,
      locationLabel: fd.str(data, "locationLabel", 160),
      venueName: fd.str(data, "venueName", 200),
      venueAddress: fd.str(data, "venueAddress", 400),
      mapUrl: fd.str(data, "mapUrl", 600),
      heroImageId: ids.heroImageId,
      flyerImageId: ids.flyerImageId,
      busFlyerImageId: ids.busFlyerImageId,
      overviewPdfId: ids.overviewPdfId,
      partnerHeroImageId: ids.partnerHeroImageId,
      updatedAt: new Date(),
    };
    const id = fd.optId(data, "id");
    if (id) await db.update(events).set(values).where(eq(events.id, id));
    else await db.insert(events).values({ ...values, isCurrent: true });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not save the event.");
  }
  published();
  return ok("Event saved and published.");
}

/* ------------------------------------------------------------------ */
/* Ordering helper                                                     */
/* ------------------------------------------------------------------ */

type Orderable = typeof listItems | typeof speakers | typeof programmeDays | typeof programmeItems | typeof fundingStreams | typeof media;

/** Swap an item's position with its neighbour, optionally within a group (same list or day). */
async function move(table: Orderable, id: number, dir: "up" | "down", scope?: ReturnType<typeof eq>) {
  const [row] = await db.select().from(table as typeof listItems).where(eq(table.id, id));
  if (!row) return;
  const cmp = dir === "up" ? lt(table.sortOrder, row.sortOrder) : gt(table.sortOrder, row.sortOrder);
  const [other] = await db
    .select()
    .from(table as typeof listItems)
    .where(scope ? and(scope, cmp) : cmp)
    .orderBy(dir === "up" ? desc(table.sortOrder) : asc(table.sortOrder))
    .limit(1);
  if (!other) return;
  await db.update(table as typeof listItems).set({ sortOrder: other.sortOrder }).where(eq(table.id, row.id));
  await db.update(table as typeof listItems).set({ sortOrder: row.sortOrder }).where(eq(table.id, other.id));
}

async function nextSort(table: Orderable, scope?: ReturnType<typeof eq>) {
  const [last] = await db
    .select({ s: table.sortOrder })
    .from(table as typeof listItems)
    .where(scope)
    .orderBy(desc(table.sortOrder))
    .limit(1);
  return (last?.s ?? 0) + 10;
}

/* ------------------------------------------------------------------ */
/* Lists                                                               */
/* ------------------------------------------------------------------ */

export async function saveListItem(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const list = fd.str(data, "list");
  if (!listDef(list)) return fail("Unknown list.");
  const title = fd.str(data, "title", 300);
  if (!title) return fail("Please enter a title.");
  const values = { title, body: fd.str(data, "body", 600), icon: fd.str(data, "icon", 40), published: fd.bool(data, "published") };
  const id = fd.optId(data, "id");
  if (id) await db.update(listItems).set(values).where(eq(listItems.id, id));
  else await db.insert(listItems).values({ ...values, published: true, list, sortOrder: await nextSort(listItems, eq(listItems.list, list)) });
  published();
  return ok(id ? "Saved." : "Added.");
}

export async function deleteListItem(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(listItems).where(eq(listItems.id, id));
  published();
}

export async function moveListItem(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  const [row] = id ? await db.select().from(listItems).where(eq(listItems.id, id)) : [];
  if (row) await move(listItems, row.id, fd.str(data, "dir") === "up" ? "up" : "down", eq(listItems.list, row.list));
  published();
}

/* ------------------------------------------------------------------ */
/* Speakers                                                            */
/* ------------------------------------------------------------------ */

export async function saveSpeaker(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = fd.str(data, "name", 160);
  if (!name) return fail("Please enter the speaker's name.");
  const id = fd.optId(data, "id");
  let photoId: number | null | undefined = undefined;
  try {
    const upload = fd.file(data, "photo");
    if (upload) photoId = (await storeUpload(upload, { alt: name })).id;
    else if (fd.bool(data, "removePhoto")) photoId = null;
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Upload failed.");
  }
  const values = {
    name,
    role: fd.str(data, "role", 120),
    bio: fd.str(data, "bio", 3000),
    published: id ? fd.bool(data, "published") : true,
    ...(photoId !== undefined ? { photoId } : {}),
  };
  if (id) await db.update(speakers).set(values).where(eq(speakers.id, id));
  else await db.insert(speakers).values({ ...values, sortOrder: await nextSort(speakers) });
  published();
  return ok(id ? "Speaker saved." : "Speaker added.");
}

export async function deleteSpeaker(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(speakers).where(eq(speakers.id, id));
  published();
}

export async function moveSpeaker(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await move(speakers, id, fd.str(data, "dir") === "up" ? "up" : "down");
  published();
}

/* ------------------------------------------------------------------ */
/* Programme                                                           */
/* ------------------------------------------------------------------ */

export async function saveDay(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const label = fd.str(data, "label", 60);
  const day = fd.str(data, "day", 10);
  if (!label || !/^\d{4}-\d{2}-\d{2}$/.test(day)) return fail("Please enter a label and a date.");
  const values = { label, day, title: fd.str(data, "title", 160) };
  const id = fd.optId(data, "id");
  if (id) await db.update(programmeDays).set(values).where(eq(programmeDays.id, id));
  else await db.insert(programmeDays).values({ ...values, sortOrder: await nextSort(programmeDays) });
  published();
  return ok(id ? "Day saved." : "Day added.");
}

export async function deleteDay(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(programmeDays).where(eq(programmeDays.id, id));
  published();
}

export async function saveSession(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const dayId = fd.optId(data, "dayId");
  const title = fd.str(data, "title", 200);
  if (!dayId || !title) return fail("Please enter what happens in this session.");
  const values = { title, time: fd.str(data, "time", 40) };
  const id = fd.optId(data, "id");
  if (id) await db.update(programmeItems).set(values).where(eq(programmeItems.id, id));
  else await db.insert(programmeItems).values({ ...values, dayId, sortOrder: await nextSort(programmeItems, eq(programmeItems.dayId, dayId)) });
  published();
  return ok(id ? "Saved." : "Added.");
}

export async function deleteSession(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(programmeItems).where(eq(programmeItems.id, id));
  published();
}

export async function moveSession(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  const [row] = id ? await db.select().from(programmeItems).where(eq(programmeItems.id, id)) : [];
  if (row) await move(programmeItems, row.id, fd.str(data, "dir") === "up" ? "up" : "down", eq(programmeItems.dayId, row.dayId));
  published();
}

/* ------------------------------------------------------------------ */
/* Funding streams                                                     */
/* ------------------------------------------------------------------ */

export async function saveStream(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const title = fd.str(data, "title", 160);
  if (!title) return fail("Please enter a title.");
  const id = fd.optId(data, "id");
  let documentId: number | null | undefined = undefined;
  try {
    const upload = fd.file(data, "document");
    if (upload) {
      if (!DOC_TYPES.includes(upload.type)) return fail("The one-page summary must be a PDF.");
      documentId = (await storeUpload(upload, { alt: `${title} summary`, docsAllowed: true })).id;
    } else if (fd.bool(data, "removeDocument")) documentId = null;
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Upload failed.");
  }
  const values = {
    title,
    summary: fd.str(data, "summary", 400),
    amountNgn: Math.max(0, fd.int(data, "amountNgn")),
    amountGbp: Math.max(0, fd.int(data, "amountGbp")),
    amountUsd: Math.max(0, fd.int(data, "amountUsd")),
    published: id ? fd.bool(data, "published") : true,
    ...(documentId !== undefined ? { documentId } : {}),
  };
  if (id) await db.update(fundingStreams).set(values).where(eq(fundingStreams.id, id));
  else await db.insert(fundingStreams).values({ ...values, sortOrder: await nextSort(fundingStreams) });
  published();
  return ok(id ? "Stream saved." : "Stream added.");
}

export async function deleteStream(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(fundingStreams).where(eq(fundingStreams.id, id));
  published();
}

export async function moveStream(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await move(fundingStreams, id, fd.str(data, "dir") === "up" ? "up" : "down");
  published();
}

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export async function uploadMedia(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const files = fd.files(data, "files");
  if (!files.length) return fail("Choose one or more photos to upload.");
  const inGallery = fd.bool(data, "inGallery");
  let sort = await nextSort(media);
  try {
    for (const f of files) {
      const saved = await storeUpload(f, { alt: "", inGallery, docsAllowed: true });
      await db.update(media).set({ sortOrder: sort }).where(eq(media.id, saved.id));
      sort += 10;
    }
  } catch (err) {
    published();
    return fail(err instanceof Error ? err.message : "Upload failed.");
  }
  published();
  return ok(`${files.length} file${files.length === 1 ? "" : "s"} uploaded. Add a short description to each photo for accessibility.`);
}

export async function updateMedia(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (!id) return fail("Missing file.");
  await db.update(media).set({ alt: fd.str(data, "alt", 300), inGallery: fd.bool(data, "inGallery") }).where(eq(media.id, id));
  published();
  return ok("Saved.");
}

export async function moveMedia(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await move(media, id, fd.str(data, "dir") === "up" ? "up" : "down", eq(media.inGallery, true));
  published();
}

export async function deleteMediaAction(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await removeMedia(id);
  published();
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export async function setEnquiryStatus(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  const status = fd.str(data, "status");
  if (id && ["new", "read", "archived"].includes(status)) {
    await db.update(enquiries).set({ status }).where(eq(enquiries.id, id));
  }
  refresh();
}

export async function deleteEnquiry(data: FormData) {
  await requireAdmin();
  const id = fd.optId(data, "id");
  if (id) await db.delete(enquiries).where(eq(enquiries.id, id));
  redirect("/admin/enquiries");
}

/* ------------------------------------------------------------------ */
/* Account and admins                                                  */
/* ------------------------------------------------------------------ */

export async function changePassword(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const current = fd.str(data, "current", 200);
  const next = fd.str(data, "next", 200);
  if (next.length < 10) return fail("Your new password must be at least 10 characters.");
  if (next !== fd.str(data, "confirm", 200)) return fail("The new passwords do not match.");
  const [acc] = await db
    .select({ password: account.password })
    .from(account)
    .where(and(eq(account.userId, me.id), eq(account.providerId, "credential")));
  if (!acc?.password || !(await verifyPassword({ hash: acc.password, password: current }))) {
    return fail("Your current password is not correct.");
  }
  await setAdminPassword(me.id, next);
  return ok("Password changed.");
}

export async function addAdmin(_prev: ActionResult, data: FormData): Promise<ActionResult> {
  await requireAdmin();
  const name = fd.str(data, "name", 120);
  const email = fd.str(data, "email", 200);
  const password = fd.str(data, "password", 200);
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return fail("Please enter a name and a valid email address.");
  try {
    await createAdminUser({ name, email, password });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not add the admin.");
  }
  refresh();
  return ok(`${name} can now sign in with the password you set. Ask them to change it after their first sign-in.`);
}

export async function removeAdmin(data: FormData) {
  const me = await requireAdmin();
  const id = fd.str(data, "id");
  if (id && id !== me.id) {
    const others = await db.select({ id: user.id }).from(user).where(ne(user.id, id));
    if (others.length) await db.delete(user).where(eq(user.id, id));
  }
  refresh();
}
