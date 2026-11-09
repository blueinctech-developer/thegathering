import type { Metadata } from "next";
import { Check } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHead } from "@/components/site/ui";
import { getGallery, getList, getSite } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite();
  return { title: "About", description: `${site.orgName}: ${site.mission}` };
}

export default async function AboutPage() {
  const [site, governance, impact, gallery] = await Promise.all([getSite(), getList("governance"), getList("impact"), getGallery()]);
  const photo = (i: number) => gallery[i] ?? gallery[0] ?? null;

  return (
    <>
      <PageHero label="About us" title="A movement of prayer, compassion and impact" intro={site.mission} photo={photo(17)} />

      {/* Photo strip */}
      <section aria-label="Photos" className="wrap grid grid-cols-6 gap-3 pb-24">
        {[photo(4), photo(10), photo(16)].map(
          (m, i) =>
            m && (
              <Reveal
                key={m.id}
                delay={i * 0.08}
                className={`relative overflow-hidden rounded-[1.75rem] bg-band ${i === 1 ? "col-span-6 aspect-[16/10] sm:col-span-3 sm:aspect-auto" : "col-span-3 aspect-[4/5] sm:col-span-3 sm:aspect-[4/3] lg:col-span-3"}`}
              >
                <MediaImage media={m} fill sizes="(min-width: 640px) 50vw, 100vw" className="object-cover" />
              </Reveal>
            ),
        )}
      </section>

      <section aria-labelledby="story-h" className="bg-band py-24 md:py-32">
        <div className="wrap grid gap-5 lg:grid-cols-2">
          <article className="card p-8 sm:p-12">
            <h2 id="story-h" className="t-section">Our story</h2>
            <div className="prose-site mt-6 text-lg">
              {paragraphs(site.story).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </article>
          <article className="panel-stripes flex flex-col justify-between rounded-[1.75rem] p-8 sm:p-12">
            <p className="t-label">What we believe</p>
            <p className="mt-8 text-[clamp(1.75rem,3vw,2.5rem)] leading-[1.15] tracking-[-0.03em]">{site.belief}</p>
          </article>
        </div>
      </section>

      {impact.length > 0 && (
        <section aria-label="Our impact" className="wrap py-24 md:py-32">
          <dl className="grid gap-12 text-center sm:grid-cols-3">
            {impact.map((s) => (
              <div key={s.id} className="flex flex-col-reverse">
                <dt className="mt-3 text-ink-2">{s.body}</dt>
                <dd className="t-display tabular-nums">{s.title}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section aria-labelledby="why-h" className="wrap grid items-center gap-14 pb-24 md:pb-32 lg:grid-cols-2 lg:gap-20">
        <div>
          <h2 id="why-h" className="t-section max-w-[16ch]">{site.whyHeading}</h2>
          <div className="t-lead prose-site mt-6">
            {paragraphs(site.whyBody).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
        {photo(11) && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-band">
            <MediaImage media={photo(11)!} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </div>
        )}
      </section>

      <section aria-labelledby="convener-h" className="bg-band py-24 md:py-32">
        <div className="wrap">
          <div className="card grid gap-10 p-6 sm:p-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:p-14">
            {photo(28) && (
              <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-band">
                <MediaImage media={photo(28)!} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
              </div>
            )}
            <div>
              <p className="t-label">The Convener</p>
              <h2 id="convener-h" className="t-section mt-4">{site.convenerName}</h2>
              <div className="t-lead prose-site mt-6">
                {paragraphs(site.convenerBio).map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="gov-h" className="wrap py-24 md:py-32">
        <SectionHead id="gov-h" title="Governance and transparency" intro={site.governanceBody} />
        {governance.length > 0 && (
          <ul className="mt-10 flex flex-wrap justify-center gap-2">
            {governance.map((g) => (
              <li key={g.id} className="inline-flex items-center gap-2 rounded-full bg-band px-5 py-2.5">
                <Check size={16} className="text-ember-deep" aria-hidden /> {g.title}
              </li>
            ))}
          </ul>
        )}
        <dl className="card-line mx-auto mt-14 grid max-w-3xl divide-y divide-line">
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
                <dt className="text-sm text-ink-3">{k}</dt>
                <dd>{k === "Email" ? <a className="link" href={`mailto:${v}`}>{v}</a> : v}</dd>
              </div>
            ))}
        </dl>
      </section>
    </>
  );
}
