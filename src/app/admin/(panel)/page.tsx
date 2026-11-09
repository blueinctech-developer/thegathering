import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, sql } from "drizzle-orm";
import { AdminSkeleton, AdminTitle, Panel } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { enquiries, events, media, speakers } from "@/lib/db/schema";
import { emailConfigured } from "@/lib/email";
import { formatDateRange, formatDateTime } from "@/lib/format";
import { usingBucket } from "@/lib/storage";

export default function AdminHome() {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const me = await requireAdmin();
  const [[ev], [counts], latest] = await Promise.all([
    db.select().from(events).where(eq(events.isCurrent, true)).limit(1),
    db
      .select({
        newEnquiries: sql<number>`(select count(*)::int from ${enquiries} where ${enquiries.status} = 'new')`,
        photos: sql<number>`(select count(*)::int from ${media} where ${media.inGallery})`,
        speakers: sql<number>`(select count(*)::int from ${speakers} where ${speakers.published})`,
      })
      .from(sql`(select 1) as one`),
    db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(5),
  ]);

  const checks = [
    { ok: Boolean(process.env.DATABASE_URL), label: "Database", detail: process.env.DATABASE_URL ? "Connected to Neon" : "Using the local development database" },
    { ok: usingBucket, label: "File storage", detail: usingBucket ? "Uploads go to your bucket" : "Uploads are stored locally (set S3_BUCKET in production)" },
    { ok: emailConfigured(), label: "Email", detail: emailConfigured() ? "Enquiries are emailed through Amazon SES" : "Enquiries are saved here but not emailed (set the SES_ variables)" },
  ];

  return (
    <>
      <AdminTitle title={`Welcome, ${me.name.split(" ")[0]}`} intro="Changes you save here appear on the public site straight away." />

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/admin/enquiries" className="card p-6 hover:border-ink">
          <p className="text-sm text-muted">New enquiries</p>
          <p className="mt-2 font-display text-4xl font-semibold">{counts.newEnquiries}</p>
        </Link>
        <Link href="/admin/media" className="card p-6 hover:border-ink">
          <p className="text-sm text-muted">Photos in the gallery</p>
          <p className="mt-2 font-display text-4xl font-semibold">{counts.photos}</p>
        </Link>
        <Link href="/admin/speakers" className="card p-6 hover:border-ink">
          <p className="text-sm text-muted">Speakers listed</p>
          <p className="mt-2 font-display text-4xl font-semibold">{counts.speakers}</p>
        </Link>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Current event">
          {ev ? (
            <>
              <p className="font-display text-2xl font-semibold">{ev.name}: {ev.theme}</p>
              <p className="mt-1 text-ink-2">{formatDateRange(ev.startsAt, ev.endsAt)}, {ev.locationLabel}</p>
              <Link href="/admin/event" className="link mt-4 inline-block text-sm">Edit event details</Link>
            </>
          ) : (
            <p className="text-ink-2">No event yet. <Link className="link" href="/admin/event">Add one</Link>.</p>
          )}
        </Panel>
        <Panel title="Setup">
          <ul className="grid gap-3">
            {checks.map((c) => (
              <li key={c.label} className="flex items-start gap-3 text-sm">
                <span aria-hidden className={`mt-1.5 size-2 shrink-0 rounded-full ${c.ok ? "bg-[#12b76a]" : "bg-[#f79009]"}`} />
                <span><strong className="font-semibold">{c.label}:</strong> {c.detail}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel title="Latest enquiries" className="mt-4">
        {latest.length === 0 ? (
          <p className="text-ink-2">No enquiries yet. Messages from the contact and partnership forms will appear here.</p>
        ) : (
          <ul className="divide-y divide-line">
            {latest.map((e) => (
              <li key={e.id}>
                <Link href={`/admin/enquiries/${e.id}`} className="flex flex-wrap items-baseline justify-between gap-2 py-3 hover:text-accent-text">
                  <span className="font-medium">
                    {e.status === "new" && <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-text">New</span>}
                    {e.name} <span className="text-muted">({e.kind === "partnership" ? "Partnership" : "Contact"})</span>
                  </span>
                  <span className="text-sm text-muted">{formatDateTime(e.createdAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
