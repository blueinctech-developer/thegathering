import Link from "next/link";
import { Suspense } from "react";
import { and, asc, eq } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Check, Field, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { ICON_CHOICES, LISTS, listDef, type ListDef } from "@/lib/content/lists";
import { db } from "@/lib/db";
import { listItems } from "@/lib/db/schema";
import { deleteListItem, moveListItem, saveListItem } from "../actions";

export default function ListsPage(props: PageProps<"/admin/lists">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ListsEditor {...props} />
    </Suspense>
  );
}

function IconSelect({ value }: { value?: string }) {
  return (
    <label className="block">
      <span className="field-label">Icon</span>
      <select name="icon" defaultValue={value ?? ""} className="input">
        <option value="">None</option>
        {ICON_CHOICES.map((i) => (
          <option key={i} value={i}>
            {i}
          </option>
        ))}
      </select>
    </label>
  );
}

function ItemFields({ def, item }: { def: ListDef; item?: { title: string; body: string; icon: string } }) {
  return (
    <div className={`grid gap-3 ${def.bodyLabel || def.icon ? "sm:grid-cols-2" : ""}`}>
      <Field label={def.titleLabel} name="title" defaultValue={item?.title} required />
      {def.bodyLabel && <Field label={def.bodyLabel} name="body" defaultValue={item?.body} />}
      {def.icon && <IconSelect value={item?.icon} />}
    </div>
  );
}

async function ListsEditor({ searchParams }: PageProps<"/admin/lists">) {
  await requireAdmin();
  const key = String((await searchParams).list ?? "pillars");
  const def = listDef(key) ?? LISTS[0];
  const items = await db
    .select()
    .from(listItems)
    .where(and(eq(listItems.list, def.key)))
    .orderBy(asc(listItems.sortOrder), asc(listItems.id));

  return (
    <>
      <AdminTitle title="Lists" intro="Short lists that appear around the site. Choose a list, then edit, reorder or add items." />
      <div className="grid gap-6 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Lists">
          <ul className="flex gap-1 overflow-x-auto lg:flex-col">
            {LISTS.map((l) => (
              <li key={l.key}>
                <Link
                  href={`/admin/lists?list=${l.key}`}
                  aria-current={l.key === def.key ? "page" : undefined}
                  className="block whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium text-ink-2 hover:bg-surface-2 aria-[current=page]:bg-ink aria-[current=page]:text-bg"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <h2 className="text-2xl">{def.label}</h2>
          <p className="mb-5 mt-1 text-sm text-muted">Appears on: {def.where}</p>
          {items.length === 0 && <p className="card mb-4 p-6 text-ink-2">This list is empty, so its section is hidden on the site. Add the first item below.</p>}
          <ul className="grid gap-3">
            {items.map((it) => (
              <li key={it.id} className="card p-4">
                <AdminForm action={saveListItem} aside={<RowActions id={it.id} move={moveListItem} remove={deleteListItem} label={it.title} />}>
                  <input type="hidden" name="id" value={it.id} />
                  <input type="hidden" name="list" value={def.key} />
                  <ItemFields def={def} item={it} />
                  <div className="mt-3">
                    <Check label="Show on the site" name="published" defaultChecked={it.published} />
                  </div>
                </AdminForm>
              </li>
            ))}
          </ul>
          <Panel title="Add an item" className="mt-6">
            <AdminForm action={saveListItem} submitLabel="Add">
              <input type="hidden" name="list" value={def.key} />
              <ItemFields def={def} />
            </AdminForm>
          </Panel>
        </div>
      </div>
    </>
  );
}
