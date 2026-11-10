import Image from "next/image";
import { Suspense } from "react";
import { asc, desc } from "drizzle-orm";
import { FilePdf } from "@phosphor-icons/react/dist/ssr";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Check, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { media } from "@/lib/db/schema";
import { MEDIA_SLOTS } from "@/lib/media";
import { deleteMediaAction, moveMedia, updateMedia, uploadMedia } from "../actions";

export default function MediaPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <MediaLibrary />
    </Suspense>
  );
}

function kb(bytes: number) {
  return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

async function MediaLibrary() {
  await requireAdmin();
  const files = await db.select().from(media).orderBy(desc(media.inGallery), asc(media.sortOrder), asc(media.id));
  const gallery = files.filter((f) => f.inGallery);
  const other = files.filter((f) => !f.inGallery);

  const Card = ({ f, ordered }: { f: (typeof files)[number]; ordered: boolean }) => (
    <li className="card overflow-hidden">
      <div className="relative aspect-[4/3] bg-surface-2">
        {f.contentType.startsWith("image/") ? (
          <Image src={`/media/${f.key}`} alt="" fill sizes="(min-width: 1024px) 300px, 50vw" className="object-cover" />
        ) : (
          <a href={`/media/${f.key}`} target="_blank" className="grid size-full place-items-center text-muted">
            <FilePdf size={40} aria-hidden />
            <span className="sr-only">Open {f.filename}</span>
          </a>
        )}
      </div>
      <div className="p-4">
        <p className="truncate text-xs text-muted" title={f.filename}>
          {f.filename} · {kb(f.bytes)}
          {f.width ? ` · ${f.width}×${f.height}` : ""}
        </p>
        <AdminForm action={updateMedia} aside={<RowActions id={f.id} move={ordered ? moveMedia : undefined} remove={deleteMediaAction} label={f.alt || f.filename} />}>
          <input type="hidden" name="id" value={f.id} />
          <label className="mt-3 block">
            <span className="field-label text-sm">Description</span>
            <input name="alt" defaultValue={f.alt} placeholder="What the photo shows" className="input min-h-10 py-2 text-sm" />
          </label>
          {f.contentType.startsWith("image/") && (
            <>
              <label className="mt-3 block">
                <span className="field-label text-sm">Used on the site for</span>
                <select name="slot" defaultValue={f.slot} className="input min-h-10 py-2 text-sm">
                  <option value="">Nothing in particular</option>
                  {MEDIA_SLOTS.map((s) => (
                    <option key={s.key} value={s.key}>{s.label}</option>
                  ))}
                </select>
              </label>
              <div className="mt-3">
                <Check label="Show in the gallery" name="inGallery" defaultChecked={f.inGallery} />
              </div>
            </>
          )}
        </AdminForm>
      </div>
    </li>
  );

  return (
    <>
      <AdminTitle title="Photos and files" intro="Upload photos for the gallery, or images and PDFs to use elsewhere (event images, funding stream summaries)." />
      <Panel title="Upload">
        <AdminForm action={uploadMedia} submitLabel="Upload">
          <div className="grid gap-4">
            <input
              type="file"
              name="files"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="block w-full rounded-xl border border-dashed border-line p-6 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:font-medium"
            />
            <p className="field-help !mt-0">JPEG, PNG, WebP or PDF, up to 15 MB each. Photos are resized and compressed automatically.</p>
            <Check label="Add photos to the gallery" name="inGallery" defaultChecked />
          </div>
        </AdminForm>
      </Panel>

      <h2 className="mb-4 mt-10 text-2xl">Gallery ({gallery.length})</h2>
      {gallery.length === 0 ? (
        <p className="card p-6 text-ink-2">No photos in the gallery yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {gallery.map((f) => (
            <Card key={f.id} f={f} ordered />
          ))}
        </ul>
      )}

      {other.length > 0 && (
        <>
          <h2 className="mb-4 mt-10 text-2xl">Other files ({other.length})</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {other.map((f) => (
              <Card key={f.id} f={f} ordered={false} />
            ))}
          </ul>
        </>
      )}
    </>
  );
}
