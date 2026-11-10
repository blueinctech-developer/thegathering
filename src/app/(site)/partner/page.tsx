import type { Metadata } from "next";
import { DownloadSimple, EnvelopeSimple, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import { ListIcon } from "@/components/icon";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHead } from "@/components/site/ui";
import { getEvent, getFundingStreams, getGallery, getList, getSite } from "@/lib/content/queries";
import { money } from "@/lib/format";
import { submitPartnership } from "../enquiry-actions";

export const metadata: Metadata = {
  title: "Partner with us",
  description: "Partner with The Gathering through prayer, giving or sponsoring a project. See the 2026 partnership streams and send a partnership enquiry.",
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
  const docsUrl = /^https?:\/\//.test(site.partnerDocsUrl) ? site.partnerDocsUrl : "";
  const overviewHref = ev?.overviewPdf ? `/media/${ev.overviewPdf.key}` : docsUrl;

  return (
    <>
      <PageHero label="Partner with us" title={site.partnerHeading} intro={site.partnerIntro} photo={ev?.partnerHero ?? gallery[8] ?? gallery[0]}>
        <a href="#enquire" className="pill pill-gold pill-lg">Send an enquiry</a>
        <a href="#streams" className="pill pill-light pill-lg">Partnership streams</a>
      </PageHero>

      {/* What partnership makes possible */}
      {reasons.length > 0 && (
        <section aria-label="What partnership makes possible" className="wrap pb-24">
          <ul className="grid gap-3 sm:grid-cols-2">
            {reasons.map((r) => (
              <li key={r.id} className="card flex items-start gap-4 p-6 ring-1 ring-line">
                <span aria-hidden className="mt-2 size-2.5 shrink-0 rounded-full bg-gold" />
                <span className="text-lg leading-snug">{r.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Partnership tiers, plus the stewardship promise */}
      {tiers.length > 0 && (
        <section aria-labelledby="tiers-h" className="bg-band py-24 md:py-32">
          <div className="wrap">
            <SectionHead id="tiers-h" title="Partnership tiers" />
            <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.map((t, i) => (
                <Reveal as="li" key={t.id} delay={(i % 3) * 0.06} className="card flex flex-col p-8">
                  <span className="grid size-12 place-items-center rounded-xl bg-ember-tint text-ember-deep">
                    <ListIcon name={t.icon} size={24} />
                  </span>
                  <h3 className="mt-7 text-2xl">{t.title}</h3>
                  <p className="mt-2 text-ink-2">{t.body}</p>
                </Reveal>
              ))}
              <li className="flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-dashed border-ember-light bg-ember-tint p-8 text-center">
                <ShieldCheck size={32} weight="light" className="text-ember-deep" aria-hidden />
                <p className="font-medium">All giving is stewarded with integrity and accountability.</p>
                {site.contactEmail && (
                  <a href={`mailto:${site.contactEmail}`} className="inline-flex items-center gap-2 font-medium text-ember-deep hover:underline">
                    <EnvelopeSimple size={18} aria-hidden /> Enquire by email
                  </a>
                )}
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* Strategic partnership streams */}
      {streams.length > 0 && (
        <section id="streams" aria-labelledby="streams-h" className="wrap py-24 md:py-32">
          <SectionHead
            id="streams-h"
            title={`Strategic partnership streams${ev ? ` for ${ev.name}` : ""}`}
            intro="Each stream represents a key area of impact. Download the detailed one-pager for any stream below."
          />
          <ol className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {streams.map((s, i) => {
              const href = s.document ? `/media/${s.document.key}` : docsUrl;
              return (
                <Reveal as="li" key={s.id} delay={(i % 4) * 0.05} className="card flex flex-col overflow-hidden ring-1 ring-line">
                  <h3 className="flex min-h-[6.75rem] items-start px-6 py-5 text-xl leading-snug text-white" style={{ background: s.color }}>
                    {i + 1}. {s.title}
                  </h3>
                  <div className="flex flex-1 flex-col p-5">
                    <dl className="grid grid-cols-3 gap-2 text-center">
                      {[
                        ["NGN", money.ngn(s.amountNgn)],
                        ["GBP", money.gbp(s.amountGbp)],
                        ["USD", money.usd(s.amountUsd)],
                      ].map(([k, v]) => (
                        <div key={k} className="flex flex-col-reverse">
                          <dt className="text-xs tracking-wide text-ink-3">{k}</dt>
                          <dd className="text-sm font-semibold tabular-nums">{v}</dd>
                        </div>
                      ))}
                    </dl>
                    {s.summary && <p className="mt-4 text-sm text-ink-2">{s.summary}</p>}
                    {href && (
                      <a
                        href={href}
                        {...(s.document ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-band px-4 py-2.5 text-sm font-medium transition-colors hover:bg-ember-tint"
                      >
                        <DownloadSimple size={16} aria-hidden /> Download one-pager
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </ol>

          {/* Total funding requirement */}
          <div className="card mt-6 grid gap-8 p-8 ring-1 ring-line sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h3 className="text-3xl">Total funding requirement</h3>
              <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-5">
                {[
                  ["Nigerian naira", site.fundingTotalNgn || money.ngn(total.ngn)],
                  ["British pounds", site.fundingTotalGbp || money.gbp(total.gbp)],
                  ["US dollars", site.fundingTotalUsd || money.usd(total.usd)],
                ].map(([k, v]) => (
                  <div key={k} className="flex flex-col-reverse">
                    <dt className="mt-1 text-xs uppercase tracking-[0.08em] text-ink-3">{k}</dt>
                    <dd className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-extrabold leading-none tracking-[-0.03em] tabular-nums text-ember-deep">{v}</dd>
                  </div>
                ))}
              </dl>
              {site.fundingNote && <p className="mt-5 text-sm text-ink-3">{site.fundingNote}</p>}
              <p className="mt-3 text-ink-2">Download the full outreach and partnership summary for {ev?.name ?? site.siteName}.</p>
            </div>
            {overviewHref && (
              <a
                href={overviewHref}
                {...(ev?.overviewPdf ? { download: true } : { target: "_blank", rel: "noopener noreferrer" })}
                className="pill pill-ember pill-lg self-start lg:self-center"
              >
                <DownloadSimple size={18} aria-hidden /> Full partnership overview
              </a>
            )}
          </div>

          {/* A note on giving */}
          <div className="mt-4 rounded-[1.5rem] border border-gold/40 bg-gold/10 p-6">
            <p className="font-semibold">A note on giving</p>
            <p className="mt-1 text-ink-2">{site.givingNote}</p>
          </div>
        </section>
      )}

      {/* Partnership enquiry */}
      <section id="enquire" aria-labelledby="enquire-h" className="bg-band py-24 md:py-32">
        <div className="wrap">
          <SectionHead id="enquire-h" title="Partnership enquiry" intro="Tell us a little about how you'd like to partner. Our team will be in touch." />
          <div className="card mx-auto mt-14 max-w-3xl p-6 ring-1 ring-line sm:p-10">
            <EnquiryForm
              action={submitPartnership}
              submitLabel="Submit enquiry"
              fields={[
                { name: "name", label: "Full name", required: true, autoComplete: "name" },
                { name: "organisation", label: "Organisation or church name", autoComplete: "organization" },
                { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
                { name: "country", label: "Country", required: true, autoComplete: "country-name" },
                {
                  name: "interest",
                  label: "Partnership interest",
                  type: "select",
                  required: true,
                  wide: true,
                  options: [...tiers.map((t) => t.title), ...streams.map((s) => `Sponsor: ${s.title}`), "Something else"],
                },
                { name: "message", label: "Message", type: "textarea", required: true },
              ]}
            />
            <p className="mt-4 text-sm text-ink-3">By submitting, you agree to be contacted by The Gathering team. No bank or payment details are requested on this form.</p>
          </div>
        </div>
      </section>
    </>
  );
}
