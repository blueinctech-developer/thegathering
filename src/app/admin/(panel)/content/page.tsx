import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Field, Panel } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/admin/session";
import { parseSiteSettings, siteSettingsGroups } from "@/lib/content/site-settings";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { saveSettings } from "../actions";

export default function ContentPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <ContentEditor />
    </Suspense>
  );
}

async function ContentEditor() {
  await requireAdmin();
  const [row] = await db.select().from(settings).where(eq(settings.key, "site"));
  const site = parseSiteSettings(row?.value);

  return (
    <>
      <AdminTitle title="Site content" intro="Headings, text and contact details used across the site. Leave a blank line between paragraphs." />
      <nav aria-label="Sections" className="mb-6 flex flex-wrap gap-2">
        {siteSettingsGroups.map((g) => (
          <a key={g.title} href={`#${g.title.toLowerCase().replace(/\W+/g, "-")}`} className="rounded-full border border-line px-3 py-1 text-sm hover:border-ink">
            {g.title}
          </a>
        ))}
      </nav>
      <AdminForm action={saveSettings} submitLabel="Save all content">
        <div className="grid gap-4">
          {siteSettingsGroups.map((g) => (
            <div key={g.title} id={g.title.toLowerCase().replace(/\W+/g, "-")} className="scroll-mt-6">
              <Panel title={g.title}>
                <div className="grid gap-4 sm:grid-cols-2">
                  {g.fields.map((f) => (
                    <Field
                      key={f.key}
                      label={f.label}
                      name={f.key}
                      defaultValue={site[f.key]}
                      long={f.long}
                      rows={f.long ? 4 : undefined}
                      help={f.help}
                      className={f.long ? "sm:col-span-2" : undefined}
                    />
                  ))}
                </div>
              </Panel>
            </div>
          ))}
        </div>
      </AdminForm>
    </>
  );
}
