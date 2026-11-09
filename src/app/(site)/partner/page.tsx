import type { Metadata } from "next";
import { DownloadSimple, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import { ListIcon } from "@/components/icon";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHead } from "@/components/site/ui";
import { getEvent, getFundingStreams, getList, getSite } from "@/lib/content/queries";
import { money } from "@/lib/format";
import { submitPartnership } from "../enquiry-actions";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Partner with The Gathering through prayer, giving or sponsoring a project. See the 2026 funding streams and send a partnership enquiry.",
};

export default async function PartnerPage() {
  const [site, ev, reasons, tiers, streams] = await Promise.all([
    getSite(),
    getEvent(),
    getList("partnerReasons"),
    getList("partnerTiers"),
    getFundingStreams(),
  ]);
  const total = streams.reduce(
    (t, s) => ({ ngn: t.ngn + s.amountNgn, gbp: t.gbp + s.amountGbp, usd: t.usd + s.amountUsd }),
    { ngn: 0, gbp: 0, usd: 0 },
  );

  return (
    <>
      <PageHero label="Partner with us" title={site.partnerHeading + "."} intro={site.partnerIntro}>
        <a href="#enquire" className="pill pill-ember pill-lg">Send an enquiry</a>
        <a href="#streams" className="pill pill-line pill-lg">Funding streams</a>
      </PageHero>

      {reasons.length > 0 && (
        <section aria-label="What partnership makes possible" className="wrap pb-24">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r, i) => (
              <li key={r.id} className="panel-stripes rounded-[1.5rem] p-6">
                <span className="grid size-8 place-items-center rounded-full bg-card text-sm tabular-nums">{i + 1}</span>
                <p className="mt-8 text-lg leading-snug tracking-tight">{r.title}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {tiers.length > 0 && (
        <section aria-labelledby="tiers-h" className="bg-band py-24 md:py-32">
          <div className="wrap">
            <SectionHead id="tiers-h" title="Ways to partner" />
            <ul className="mt-16 grid gap-4 md:grid-cols-6">
              {tiers.map((t, i) => (
                <Reveal as="li" key={t.id} delay={(i % 3) * 0.06} className={`card flex flex-col p-8 ${i < 2 ? "md:col-span-3" : "md:col-span-2"}`}>
                  <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">
                    <ListIcon name={t.icon} size={24} />
                  </span>
                  <h3 className="mt-8 text-2xl">{t.title}</h3>
                  <p className="mt-2 text-ink-2">{t.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {streams.length > 0 && (
        <section id="streams" aria-labelledby="streams-h" className="wrap py-24 md:py-32">
          <SectionHead
            id="streams-h"
            title={`Partnership streams${ev ? ` for ${ev.name}` : ""}`}
            intro="Each stream is a specific area of work you can sponsor in full or in part."
          />
          <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {streams.map((s, i) => (
              <Reveal as="li" key={s.id} delay={(i % 4) * 0.05} className="card-line flex flex-col p-6">
                <span className="t-label">Stream {i + 1}</span>
                <h3 className="mt-3 text-xl">{s.title}</h3>
                {s.summary && <p className="mt-2 text-sm text-ink-2">{s.summary}</p>}
                <div className="mt-auto pt-8">
                  <p className="text-[1.9rem] leading-none tracking-[-0.03em] tabular-nums">{money.ngn(s.amountNgn)}</p>
                  <p className="mt-2 text-sm tabular-nums text-ink-3">
                    {money.gbp(s.amountGbp)} or {money.usd(s.amountUsd)}
                  </p>
                  {s.document && (
                    <a href={`/media/${s.document.key}`} className="link mt-4 inline-flex items-center gap-1.5 text-sm" download>
                      <DownloadSimple size={16} aria-hidden /> One-page summary
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </ol>

          <div className="mt-6 rounded-[2rem] bg-ground p-8 text-white sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <h3 className="text-2xl">Total funding requirement</h3>
                <dl className="mt-8 grid gap-8 sm:grid-cols-3">
                  {[
                    ["Nigerian naira", money.ngn(total.ngn)],
                    ["British pounds", money.gbp(total.gbp)],
                    ["US dollars", money.usd(total.usd)],
                  ].map(([k, v], i) => (
                    <div key={k}>
                      <dt className="text-sm text-white/60">{k}</dt>
                      <dd className={`mt-2 text-[clamp(1.9rem,3.4vw,2.75rem)] leading-none tracking-[-0.03em] tabular-nums ${i === 0 ? "text-ember" : ""}`}>{v}</dd>
                    </div>
                  ))}
                </dl>
                {site.fundingNote && <p className="mt-8 text-sm text-white/55">{site.fundingNote}</p>}
              </div>
              {ev?.overviewPdf && (
                <a href={`/media/${ev.overviewPdf.key}`} download className="pill pill-ember pill-lg self-start">
                  <DownloadSimple size={18} aria-hidden /> Partnership overview
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      <section id="enquire" aria-labelledby="enquire-h" className="bg-band py-24 md:py-32">
        <div className="wrap">
          <SectionHead id="enquire-h" title="Partnership enquiry" intro="Tell us how you would like to partner and a member of the team will contact you personally." />
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 lg:grid-cols-[1fr_1.6fr]">
            <aside className="panel-stripes flex flex-col gap-6 rounded-[1.75rem] p-8">
              <p className="text-lg leading-snug tracking-tight">{site.givingNote}</p>
              {site.contactEmail && (
                <a href={`mailto:${site.contactEmail}`} className="mt-auto inline-flex items-center gap-2 font-medium">
                  <EnvelopeSimple size={20} className="text-ember-deep" aria-hidden /> {site.contactEmail}
                </a>
              )}
            </aside>
            <div className="card p-6 sm:p-10">
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
          </div>
        </div>
      </section>
    </>
  );
}
