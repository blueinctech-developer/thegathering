import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { ArrowLeft, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { AdminSkeleton, Panel } from "@/components/admin/fields";
import { RowActions } from "@/components/admin/row-actions";
import { requireAdmin } from "@/lib/admin/session";
import { db } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { formatDateTime } from "@/lib/format";
import { deleteEnquiry, setEnquiryStatus } from "../../actions";

export default function EnquiryPage(props: PageProps<"/admin/enquiries/[id]">) {
  return (
    <Suspense fallback={<AdminSkeleton />}>
      <Enquiry {...props} />
    </Suspense>
  );
}

const EMAIL_STATUS: Record<string, string> = {
  sent: "Emailed to the team",
  failed: "Email delivery failed (the message is safe here)",
  skipped: "Not emailed (email is not set up)",
  pending: "Email pending",
};

async function Enquiry({ params }: PageProps<"/admin/enquiries/[id]">) {
  await requireAdmin();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  let [e] = await db.select().from(enquiries).where(eq(enquiries.id, id));
  if (!e) notFound();
  if (e.status === "new") {
    [e] = await db.update(enquiries).set({ status: "read" }).where(eq(enquiries.id, id)).returning();
  }

  const rows: [string, string][] = [
    ["Email", e.email],
    ["Phone", e.phone],
    ["Organisation", e.organisation],
    ["Country", e.country],
    ["Partnership interest", e.interest],
    ["Subject", e.subject],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <Link href="/admin/enquiries" className="mb-6 inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
        <ArrowLeft size={16} aria-hidden /> All enquiries
      </Link>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted">{e.kind === "partnership" ? "Partnership enquiry" : "Contact message"} · #{e.id}</p>
          <h1 className="mt-1 text-3xl sm:text-4xl">{e.name}</h1>
          <p className="mt-1 text-sm text-muted">{formatDateTime(e.createdAt)} · {EMAIL_STATUS[e.emailStatus] ?? e.emailStatus}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a href={`mailto:${e.email}?subject=${encodeURIComponent(`Re: ${e.subject || "Your message to The Gathering"}`)}`} className="btn btn-primary min-h-11">
            <EnvelopeSimple size={18} aria-hidden /> Reply by email
          </a>
          <form action={setEnquiryStatus}>
            <input type="hidden" name="id" value={e.id} />
            <input type="hidden" name="status" value={e.status === "archived" ? "read" : "archived"} />
            <button className="btn btn-secondary min-h-11">{e.status === "archived" ? "Move to inbox" : "Archive"}</button>
          </form>
          <RowActions id={e.id} remove={deleteEnquiry} label="this enquiry" />
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Panel title="Message">
          <p className="whitespace-pre-wrap text-ink">{e.message}</p>
        </Panel>
        <Panel title="Details">
          <dl className="grid gap-3 text-sm">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-muted">{k}</dt>
                <dd className="font-medium break-words">{v}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </>
  );
}
