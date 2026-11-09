import { Suspense } from "react";
import { asc } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Field, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { programmeDays, programmeItems } from "@/lib/db/schema";
import { formatDay } from "@/lib/format";
import { deleteDay, deleteSession, moveSession, saveDay, saveSession } from "../actions";

export default function ProgrammePage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ProgrammeEditor />
    </Suspense>
  );
}

async function ProgrammeEditor() {
  await requireAdmin();
  const [days, items] = await Promise.all([
    db.select().from(programmeDays).orderBy(asc(programmeDays.sortOrder), asc(programmeDays.day)),
    db.select().from(programmeItems).orderBy(asc(programmeItems.sortOrder), asc(programmeItems.id)),
  ]);

  return (
    <>
      <AdminTitle title="Programme" intro="Each day of the conference and what happens in it. Times are optional. The note above the programme is under Site content > Partnership." />
      <div className="grid gap-4">
        {days.map((d) => (
          <Panel key={d.id}>
            <details>
              <summary className="flex cursor-pointer list-none flex-wrap items-baseline justify-between gap-2">
                <span>
                  <span className="font-display text-xl font-semibold">{d.label}</span>
                  <span className="text-muted"> · {formatDay(d.day)}{d.title ? ` · ${d.title}` : ""}</span>
                </span>
                <span className="text-sm text-accent-text">Edit day</span>
              </summary>
              <div className="mt-4 border-t border-line pt-4">
                <AdminForm action={saveDay} aside={<RowActions id={d.id} remove={deleteDay} label={d.label} />}>
                  <input type="hidden" name="id" value={d.id} />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Label" name="label" defaultValue={d.label} required />
                    <Field label="Date" name="day" type="date" defaultValue={d.day} required />
                    <Field label="Day title" name="title" defaultValue={d.title} />
                  </div>
                </AdminForm>
              </div>
            </details>

            <ul className="mt-5 grid gap-2">
              {items
                .filter((i) => i.dayId === d.id)
                .map((it) => (
                  <li key={it.id} className="rounded-xl border border-line p-3">
                    <AdminForm action={saveSession} className="grid gap-3" aside={<RowActions id={it.id} move={moveSession} remove={deleteSession} label={it.title} />}>
                      <input type="hidden" name="id" value={it.id} />
                      <input type="hidden" name="dayId" value={d.id} />
                      <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                        <Field label="Time" name="time" defaultValue={it.time} placeholder="e.g. 9:00 AM" />
                        <Field label="Session" name="title" defaultValue={it.title} required />
                      </div>
                    </AdminForm>
                  </li>
                ))}
            </ul>
            <div className="mt-4 rounded-xl border border-dashed border-line p-3">
              <AdminForm action={saveSession} submitLabel="Add session">
                <input type="hidden" name="dayId" value={d.id} />
                <div className="grid gap-3 sm:grid-cols-[8rem_1fr]">
                  <Field label="Time" name="time" placeholder="Optional" />
                  <Field label="New session" name="title" required />
                </div>
              </AdminForm>
            </div>
          </Panel>
        ))}
      </div>

      <Panel title="Add a day" className="mt-8">
        <AdminForm action={saveDay} submitLabel="Add day">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Label" name="label" placeholder="Day 4" required />
            <Field label="Date" name="day" type="date" required />
            <Field label="Day title" name="title" />
          </div>
        </AdminForm>
      </Panel>
    </>
  );
}
