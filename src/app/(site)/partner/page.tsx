import type { Metadata } from "next";
import { Check, DownloadSimple, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { ListIcon } from "@/components/icon";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
import { getEvent, getFundingStreams, getGallery, getList, getSite } from "@/lib/content/queries";
import { money } from "@/lib/format";
import { submitPartnership } from "../enquiry-actions";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Partner with The Gathering through prayer, giving or sponsoring a project. See the 2026 funding streams and send a partnership enquiry.",
};

export default async function PartnerPage() {
  const [site, ev, reasons, tiers, streams, gallery] = await Promise.all([
    getSite(),
    getEvent(),
    getList("partnerReasons"),
    getList("partnerTiers"),
    getFundingStreams(),
    getGallery(),
  ]);
  const total = streams.reduce(
    (t, s) => ({ ngn: t.ngn + s.amountNgn, gbp: t.gbp + s.amountGbp, usd: t.usd + s.amountUsd }),
    { ngn: 0, gbp: 0, usd: 0 },
  );

  return (
    <>
      <PageHeader eyebrow="Partner with us" title={site.partnerHeading} intro={site.partnerIntro} photo={gallery[17] ?? gallery[0]}>
        <a href="#enquire" className="btn btn-primary">Send an enquiry</a>
        <a href="#streams" className="btn btn-secondary">Funding streams</a>
      </PageHeader>

      {reasons.length > 0 && (
        <section aria-labelledby="reasons-h" className="wrap pt-6 lg:pt-14">
          <h2 id="reasons-h" className="sr-only">What your partnership makes possible</h2>
          <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <li key={r.id} className="flex gap-3 border-t-2 border-accent pt-5 text-lg font-medium">
                <Check size={20} className="mt-1 shrink-0 text-accent-text" aria-hidden /> {r.title}
              </li>
            ))}
          </ul>
        </section>
      )}

      {tiers.length > 0 && (
        <section aria-labelledby="tiers-h" className="wrap py-20 md:py-28">
          <h2 id="tiers-h" className="text-4xl sm:text-5xl">Ways to partner</h2>
          <ul className="mt-12 grid gap-4 md:grid-cols-6">
            {tiers.map((t, i) => (
              <Reveal
                as="li"
                key={t.id}
                delay={(i % 3) * 0.06}
                className={`card flex flex-col p-7 ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}
              >
                <ListIcon name={t.icon} size={30} className="text-accent-text" />
                <h3 className="mt-8 text-2xl">{t.title}</h3>
                <p className="mt-2 text-ink-2">{t.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {streams.length > 0 && (
        <section id="streams" aria-labelledby="streams-h" className="border-y border-line bg-surface py-20 md:py-28">
          <div className="wrap">
            <h2 id="streams-h" className="max-w-[22ch] text-4xl sm:text-5xl">
              Strategic partnership streams{ev ? ` for ${ev.name}` : ""}
            </h2>
            <p className="mt-4 max-w-[60ch] text-lg text-ink-2">Each stream is a specific area of work you can sponsor in full or in part.</p>

            <ol className="mt-12 grid gap-x-10 md:grid-cols-2">
              {streams.map((s, i) => (
                <li key={s.id} className="grid grid-cols-[2.5rem_1fr] gap-x-4 border-t border-line py-7">
                  <span className="font-display text-sm font-semibold tabular-nums text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-2xl">{s.title}</h3>
                    {s.summary && <p className="mt-1.5 text-ink-2">{s.summary}</p>}
                    <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                      <span className="font-display text-3xl font-semibold tracking-tight tabular-nums">{money.ngn(s.amountNgn)}</span>
                      <span className="text-sm tabular-nums text-muted">
                        {money.gbp(s.amountGbp)} <span aria-hidden>/</span> {money.usd(s.amountUsd)}
                      </span>
                    </p>
                    {s.document && (
                      <a href={`/media/${s.document.key}`} className="link mt-3 inline-flex items-center gap-1.5 text-sm" download>
                        <DownloadSimple size={16} aria-hidden /> Download the one-page summary (PDF)
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ol>

            <div className="mt-10 grid gap-8 rounded-[var(--radius-card)] bg-ink p-8 text-bg sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h3 className="text-2xl text-bg">Total funding requirement</h3>
                <dl className="mt-6 grid gap-6 sm:grid-cols-3">
                  {[
                    ["Nigerian naira", money.ngn(total.ngn)],
                    ["British pounds", money.gbp(total.gbp)],
                    ["US dollars", money.usd(total.usd)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <dt className="text-sm opacity-70">{k}</dt>
                      <dd className="mt-1 font-display text-3xl font-semibold tabular-nums sm:text-4xl">{v}</dd>
                    </div>
                  ))}
                </dl>
                {site.fundingNote && <p className="mt-6 text-sm opacity-70">{site.fundingNote}</p>}
              </div>
              {ev?.overviewPdf && (
                <a href={`/media/${ev.overviewPdf.key}`} download className="btn btn-primary self-start">
                  <DownloadSimple size={18} aria-hidden /> Partnership overview (PDF)
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="enquire" aria-labelledby="enquire-h" className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <h2 id="enquire-h" className="text-4xl sm:text-5xl">Partnership enquiry</h2>
          <p className="mt-5 text-lg text-ink-2">Tell us how you would like to partner and a member of the team will contact you personally.</p>
          <p className="mt-8 rounded-[var(--radius-card)] bg-accent-soft p-5 text-ink">{site.givingNote}</p>
          {site.contactEmail && (
            <a href={`mailto:${site.contactEmail}`} className="mt-6 inline-flex items-center gap-2 font-medium hover:text-accent-text">
              <EnvelopeSimple size={20} className="text-accent-text" aria-hidden /> {site.contactEmail}
            </a>
          )}
        </div>
        <div className="card p-6 sm:p-10 lg:col-span-7 lg:col-start-6">
          <EnquiryForm
            action={submitPartnership}
            submitLabel="Send enquiry"
            fields={[
              { name: "name", label: "Full name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "Organisation or church", autoComplete: "organization" },
              { name: "country", label: "Country", required: true, autoComplete: "country-name" },
              { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
              {
                name: "interest",
                label: "How would you like to partner?",
                type: "select",
                required: true,
                options: [...tiers.map((t) => t.title), ...streams.map((s) => `Sponsor: ${s.title}`), "Something else"],
              },
              { name: "message", label: "Message", type: "textarea", required: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}
