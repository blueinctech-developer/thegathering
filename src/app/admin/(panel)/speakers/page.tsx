import Image from "next/image";
import { Suspense } from "react";
import { asc, inArray } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Check, Field, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { media, speakers } from "@/lib/db/schema";
import { deleteSpeaker, moveSpeaker, saveSpeaker } from "../actions";

export default function SpeakersPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <SpeakersEditor />
    </Suspense>
  );
}

async function SpeakersEditor() {
  await requireAdmin();
  const rows = await db.select().from(speakers).orderBy(asc(speakers.sortOrder), asc(speakers.id));
  const photoIds = rows.map((r) => r.photoId).filter((v): v is number => v !== null);
  const photos = photoIds.length ? await db.select().from(media).where(inArray(media.id, photoIds)) : [];

  return (
    <>
      <AdminTitle title="Speakers" intro="Ministers shown in the lineup. Use the arrows to change the order. A photo is optional." />
      <ul className="grid gap-3">
        {rows.map((s) => {
          const photo = photos.find((p) => p.id === s.photoId);
          return (
            <li key={s.id} className="card">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center gap-4 p-4">
                  <span className="relative grid size-12 shrink-0 place-items-center overflow-hidden rounded-full bg-surface-2 text-sm font-semibold text-muted">
                    {photo ? <Image src={`/media/${photo.key}`} alt="" fill sizes="48px" className="object-cover" /> : s.name.slice(0, 1)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{s.name}</span>
                    <span className="text-sm text-muted">{s.role || "No role"}{!s.published && " · Hidden"}</span>
                  </span>
                  <span className="text-sm text-accent-text group-open:hidden">Edit</span>
                  <span className="hidden text-sm text-muted group-open:inline">Close</span>
                </summary>
                <div className="border-t border-line p-4 sm:p-6">
                  <AdminForm action={saveSpeaker} aside={<RowActions id={s.id} move={moveSpeaker} remove={deleteSpeaker} label={s.name} />}>
                    <input type="hidden" name="id" value={s.id} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Name" name="name" defaultValue={s.name} required />
                      <Field label="Role" name="role" defaultValue={s.role} help="e.g. Convener, Minister, Worship Minister" />
                      <Field label="Short biography" name="bio" defaultValue={s.bio} long className="sm:col-span-2" />
                      <label className="block text-sm sm:col-span-2">
                        <span className="field-label">Photo</span>
                        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:font-medium" />
                      </label>
                      <div className="flex flex-wrap gap-6 sm:col-span-2">
                        <Check label="Show on the site" name="published" defaultChecked={s.published} />
                        {photo && <Check label="Remove photo" name="removePhoto" />}
                      </div>
                    </div>
                  </AdminForm>
                </div>
              </details>
            </li>
          );
        })}
      </ul>

      <Panel title="Add a speaker" className="mt-8">
        <AdminForm action={saveSpeaker} submitLabel="Add speaker">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" name="name" required />
            <Field label="Role" name="role" />
            <label className="block text-sm sm:col-span-2">
              <span className="field-label">Photo (optional)</span>
              <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:font-medium" />
            </label>
          </div>
        </AdminForm>
      </Panel>
    </>
  );
}
