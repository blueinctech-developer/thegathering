import type { Metadata } from "next";
import Link from "next/link";
import { ListIcon } from "@/components/icon";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHead } from "@/components/site/ui";
import { YouTube } from "@/components/site/youtube";
import { getGallery, getList, getSite } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";

export const metadata: Metadata = {
  title: "The Gathering Land",
  description: "Land secured in Ido Local Government Area, Oyo State, to host future Gatherings, outreach and training.",
};

export default async function LandPage() {
  const [site, vision, infra, gallery] = await Promise.all([getSite(), getList("landVision"), getList("infrastructure"), getGallery()]);

  return (
    <>
      <PageHero label="The Gathering Land" title={site.landHeading} intro={paragraphs(site.landBody)[0]} photo={gallery[9] ?? gallery[0]} />

      <section aria-label="Land at a glance" className="wrap pb-24">
        <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="panel-stripes grid content-between gap-10 rounded-[2rem] p-8 sm:p-12">
            <dl className="grid gap-10 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-ink-2">{site.landSecuredNote}</dt>
                <dd className="t-display mt-2">{site.landSecured}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-2">{site.landTotalNote}</dt>
                <dd className="t-display mt-2">{site.landTotal}</dd>
              </div>
            </dl>
            {vision.length > 0 && (
              <div>
                <h2 className="text-xl tracking-tight">Vision for the land</h2>
                <ul className="dots mt-5">
                  {vision.map((v) => (
                    <li key={v.id}>{v.title}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {site.videoYoutubeId ? (
            <div className="mx-auto w-full max-w-[24rem] rounded-[2rem] bg-band p-3">
              <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
            </div>
          ) : (
            gallery[16] && (
              <div className="relative overflow-hidden rounded-[2rem] bg-band">
                <MediaImage media={gallery[16]} fill sizes="45vw" className="object-cover" />
              </div>
            )
          )}
        </div>
      </section>

      {infra.length > 0 && (
        <section aria-labelledby="infra-h" className="bg-band py-24 md:py-32">
          <div className="wrap">
            <SectionHead id="infra-h" title="What we are building" intro="Each project can be sponsored by an individual, church or organisation." />
            <ul className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {infra.map((b, i) => (
                <Reveal as="li" key={b.id} delay={(i % 3) * 0.06} className="card p-8">
                  <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">
                    <ListIcon name={b.icon} size={24} />
                  </span>
                  <h3 className="mt-8 text-2xl">{b.title}</h3>
                  {b.body && <p className="mt-2 text-ink-2">{b.body}</p>}
                </Reveal>
              ))}
            </ul>
            <div className="mt-12 flex flex-wrap justify-center gap-3">
              <Link href="/partner#streams" className="pill pill-ink pill-lg">Sponsor a project</Link>
              <Link href="/partner#enquire" className="pill pill-line pill-lg">Ask us about the land</Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
