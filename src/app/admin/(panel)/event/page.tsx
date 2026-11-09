import { Suspense } from "react";
import { asc, eq } from "drizzle-orm";
import { AdminForm } from "@/components/admin/admin-form";
import { AdminSkeleton, AdminTitle, Field, Panel } from "@/components/admin/fields";
import { MediaSelect } from "@/components/admin/media-select";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { events, media } from "@/lib/db/schema";
import { saveEvent } from "../actions";

export default function EventPage() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <EventEditor />
    </Suspense>
  );
}

/** A Date as the "YYYY-MM-DDTHH:mm" wall-clock value in Lagos (UTC+1). */
function lagosInput(d: Date | undefined) {
  return d ? new Date(d.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16) : "";
}

async function EventEditor() {
  await requireAdmin();
  const [[ev], files] = await Promise.all([
    db.select().from(events).where(eq(events.isCurrent, true)).limit(1),
    db.select().from(media).orderBy(asc(media.sortOrder), asc(media.id)),
  ]);
  const images = files.filter((f) => f.contentType.startsWith("image/"));
  const pdfs = files.filter((f) => f.contentType === "application/pdf");
  const byId = (id: number | null | undefined) => files.find((f) => f.id === id) ?? null;

  return (
    <>
      <AdminTitle title="Event" intro="The current edition of The Gathering. Its name, theme and dates appear across the whole site." />
      <AdminForm action={saveEvent} submitLabel="Save event">
        <input type="hidden" name="id" value={ev?.id ?? ""} />
        <div className="grid gap-4">
          <Panel title="Name and theme">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Event name" name="name" defaultValue={ev?.name ?? "The Gathering 2026"} required />
              <Field label="Theme" name="theme" defaultValue={ev?.theme} required />
              <Field label="Secondary theme line" name="subtitle" defaultValue={ev?.subtitle} help="Optional, e.g. Breaking Territories." />
              <Field label="Short location" name="locationLabel" defaultValue={ev?.locationLabel} help="Shown on the home page, e.g. Ibadan, Oyo State, Nigeria." />
              <Field label="Summary" name="summary" defaultValue={ev?.summary} long className="sm:col-span-2" help="One or two sentences for the event page and search results." />
            </div>
          </Panel>
          <Panel title="Dates (Lagos time)">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts" name="startsAt" type="datetime-local" defaultValue={lagosInput(ev?.startsAt)} required help="The countdown runs to this time." />
              <Field label="Ends" name="endsAt" type="datetime-local" defaultValue={lagosInput(ev?.endsAt)} required />
            </div>
          </Panel>
          <Panel title="Venue">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Venue name" name="venueName" defaultValue={ev?.venueName} />
              <Field label="Google Maps link" name="mapUrl" type="url" defaultValue={ev?.mapUrl} />
              <Field label="Address" name="venueAddress" defaultValue={ev?.venueAddress} long rows={2} className="sm:col-span-2" />
            </div>
          </Panel>
          <Panel title="Images and documents">
            <div className="grid gap-4 md:grid-cols-2">
              <MediaSelect label="Hero photo" name="heroImageId" current={byId(ev?.heroImageId)} options={images} help="Large photo at the top of the home page. Landscape works best." />
              <MediaSelect label="Speakers lineup flyer" name="flyerImageId" current={byId(ev?.flyerImageId)} options={images} />
              <MediaSelect label="Bus flyer" name="busFlyerImageId" current={byId(ev?.busFlyerImageId)} options={images} />
              <MediaSelect
                label="Partnership overview (PDF)"
                name="overviewPdfId"
                current={byId(ev?.overviewPdfId)}
                options={pdfs}
                accept="application/pdf"
                help="Offered as a download on the Partner page."
              />
            </div>
          </Panel>
        </div>
      </AdminForm>
    </>
  );
}
