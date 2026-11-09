import Link from "next/link";
import { Suspense } from "react";
import { desc, eq, ne } from "drizzle-orm";
import { AdminSkeleton, AdminTitle } from "@/components/admin/fields";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";

export default function EnquiriesPage(props: PageProps<"/admin/enquiries">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Enquiries {...props} />
    </Suspense>
  );
}

const TABS = [
  { key: "inbox", label: "Inbox" },
  { key: "archived", label: "Archived" },
] as const;

async function Enquiries({ searchParams }: PageProps<"/admin/enquiries">) {
  await requireAdmin();
  const view = (await searchParams).view === "archived" ? "archived" : "inbox";
  const rows = await db
    .select()
    .from(enquiries)
    .where(view === "archived" ? eq(enquiries.status, "archived") : ne(enquiries.status, "archived"))
    .orderBy(desc(enquiries.createdAt))
    .limit(200);

  return (
    <>
      <AdminTitle title="Enquiries" intro="Messages sent through the contact and partnership forms. Every message is saved here, even if email delivery fails." />
      <div className="mb-5 flex gap-2">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.key === "inbox" ? "/admin/enquiries" : "/admin/enquiries?view=archived"}
            aria-current={view === t.key ? "page" : undefined}
            className="rounded-full border border-line px-4 py-1.5 text-sm font-medium aria-[current=page]:border-ink aria-[current=page]:bg-ink aria-[current=page]:text-bg"
          >
            {t.label}
          </Link>
        ))}
      </div>
      {rows.length === 0 ? (
        <div className="card p-10 text-center text-ink-2">{view === "archived" ? "No archived enquiries." : "No enquiries yet. New messages will appear here."}</div>
      ) : (
        <ul className="card divide-y divide-line">
          {rows.map((e) => (
            <li key={e.id}>
              <Link href={`/admin/enquiries/${e.id}`} className="grid gap-1 px-5 py-4 hover:bg-surface-2 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-4">
                <span>
                  <span className="font-semibold">
                    {e.status === "new" && <span className="mr-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs font-semibold text-accent-text">New</span>}
                    {e.name}
                  </span>
                  <span className="text-muted"> · {e.kind === "partnership" ? `Partnership${e.interest ? `: ${e.interest}` : ""}` : e.subject || "Contact"}</span>
                  <span className="mt-1 block truncate text-sm text-ink-2">{e.message}</span>
                </span>
                <span className="text-sm text-muted">{formatDateTime(e.createdAt)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
