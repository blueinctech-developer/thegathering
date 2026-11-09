import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { PartnerBand } from "@/components/site/partner-band";
import { Reveal } from "@/components/site/reveal";
import { getGallery, getList, getSite } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: "About", description: `${site.orgName}: ${site.mission}` };
}

export default async function AboutPage() {
  const [site, governance, impact, gallery] = await Promise.all([getSite(), getList("governance"), getList("impact"), getGallery()]);
  const [, , photoA, , , , , , , , photoB, photoC] = gallery;

  return (
    <>
      <PageHeader eyebrow="Who we are" title={site.tagline} intro={site.mission} photo={photoA} />

      <section className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <h2 className="text-4xl sm:text-5xl lg:col-span-4">Our story</h2>
        <div className="prose-site max-w-[62ch] text-lg lg:col-span-7 lg:col-start-6">
          {paragraphs(site.story).map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="!mt-8 font-display text-2xl font-medium leading-snug tracking-tight text-ink">{site.belief}</p>
        </div>
      </section>

      {impact.length > 0 && (
        <section aria-label="Our impact" className="border-y border-line bg-surface">
          <dl className="wrap grid gap-10 py-14 sm:grid-cols-3">
            {impact.map((s) => (
              <div key={s.id} className="flex flex-col-reverse">
                <dt className="mt-2 text-ink-2">{s.body}</dt>
                <dd className="font-display text-6xl font-semibold tracking-tight tabular-nums">{s.title}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 className="text-4xl sm:text-5xl">{site.whyHeading}</h2>
          <div className="prose-site mt-7 max-w-[60ch] text-lg">
            {paragraphs(site.whyBody).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        {photoB && (
          <Reveal className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
            <MediaImage media={photoB} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </Reveal>
        )}
      </section>

      <section aria-labelledby="convener-h" className="bg-surface-2/60 py-20 md:py-28">
        <div className="wrap grid gap-12 lg:grid-cols-12">
          {photoC && (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-card)] bg-surface-2 lg:col-span-4">
              <MediaImage media={photoC} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
            </div>
          )}
          <div className={photoC ? "lg:col-span-7 lg:col-start-6 lg:self-center" : "lg:col-span-8"}>
            <p className="eyebrow">The Convener</p>
            <h2 id="convener-h" className="mt-4 text-4xl sm:text-5xl">{site.convenerName}</h2>
            <div className="prose-site mt-6 max-w-[60ch] text-lg">
              {paragraphs(site.convenerBio).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="gov-h" className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 id="gov-h" className="text-4xl sm:text-5xl">Governance and transparency</h2>
          <p className="mt-6 max-w-[56ch] text-lg text-ink-2">{site.governanceBody}</p>
          {governance.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {governance.map((g) => (
                <li key={g.id} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium">
                  <Check size={16} className="text-accent-text" aria-hidden /> {g.title}
                </li>
              ))}
            </ul>
          )}
        </div>
        <dl className="card grid content-start divide-y divide-line self-start lg:col-span-6 lg:col-start-7">
          {[
            ["Organisation", site.orgName],
            ["Registration", site.registration],
            ["Parent ministry", site.parentOrg],
            ["Convener", site.convenerName],
            ["Email", site.contactEmail],
            ["Address", site.address],
          ]
            .filter(([, v]) => v)
            .map(([k, v]) => (
              <div key={k} className="grid gap-1 px-6 py-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="font-medium">{k === "Email" ? <a className="link" href={`mailto:${v}`}>{v}</a> : v}</dd>
              </div>
            ))}
        </dl>
      </section>

      <PartnerBand />
    </>
  );
}
