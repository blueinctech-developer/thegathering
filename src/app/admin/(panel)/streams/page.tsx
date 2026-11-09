import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Check, Field, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { fundingStreams, media } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { deleteStream, moveStream, saveStream } from "../actions";

export default function StreamsPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <StreamsEditor />
    </Suspense>
  );
}

function AmountFields({ ngn, gbp, usd }: { ngn?: number; gbp?: number; usd?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Field label="Naira (NGN)" name="amountNgn" type="number" min={0} defaultValue={ngn} />
      <Field label="Pounds (GBP)" name="amountGbp" type="number" min={0} defaultValue={gbp} />
      <Field label="Dollars (USD)" name="amountUsd" type="number" min={0} defaultValue={usd} />
    </div>
  );
}

async function StreamsEditor() {
  await requireAdmin();
  const [rows, files] = await Promise.all([
    db.select().from(fundingStreams).orderBy(asc(fundingStreams.sortOrder), asc(fundingStreams.id)),
    db.select({ id: media.id, filename: media.filename, key: media.key }).from(media),
  ]);
  const total = rows.filter((r) => r.published).reduce((t, r) => t + r.amountNgn, 0);

  return (
    <>
      <AdminTitle title="Funding streams" intro="Areas partners can sponsor, shown on the Partner page. The total is added up automatically.">
        <p className="text-right">
          <span className="block text-sm text-muted">Total shown</span>
          <span className="font-display text-2xl font-semibold">{money.ngn(total)}</span>
        </p>
      </AdminTitle>
      <ul className="grid gap-3">
        {rows.map((s, i) => {
          const doc = files.find((f) => f.id === s.documentId);
          return (
            <li key={s.id} className="card">
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-wrap items-baseline gap-x-4 gap-y-1 p-4">
                  <span className="font-display text-sm font-semibold text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-semibold">{s.title}{!s.published && <span className="text-sm font-normal text-muted"> · Hidden</span>}</span>
                  <span className="tabular-nums text-ink-2">{money.ngn(s.amountNgn)}</span>
                  <span className="text-sm text-accent-text group-open:hidden">Edit</span>
                </summary>
                <div className="border-t border-line p-4 sm:p-6">
                  <AdminForm action={saveStream} aside={<RowActions id={s.id} move={moveStream} remove={deleteStream} label={s.title} />}>
                    <input type="hidden" name="id" value={s.id} />
                    <div className="grid gap-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Title" name="title" defaultValue={s.title} required />
                        <Field label="One-line summary" name="summary" defaultValue={s.summary} />
                      </div>
                      <AmountFields ngn={s.amountNgn} gbp={s.amountGbp} usd={s.amountUsd} />
                      <label className="block text-sm">
                        <span className="field-label">One-page summary (PDF)</span>
                        {doc && (
                          <a className="link mb-2 inline-block" href={`/media/${doc.key}`} target="_blank">
                            Current: {doc.filename}
                          </a>
                        )}
                        <input type="file" name="document" accept="application/pdf" className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:font-medium" />
                      </label>
                      <div className="flex flex-wrap gap-6">
                        <Check label="Show on the site" name="published" defaultChecked={s.published} />
                        {doc && <Check label="Remove PDF" name="removeDocument" />}
                      </div>
                    </div>
                  </AdminForm>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
      <Panel title="Add a funding stream" className="mt-8">
        <AdminForm action={saveStream} submitLabel="Add stream">
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Title" name="title" required />
              <Field label="One-line summary" name="summary" />
            </div>
            <AmountFields />
          </div>
        </AdminForm>
      </Panel>
    </>
  );
}
