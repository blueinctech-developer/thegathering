import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { ListIcon } from "@/components/icon";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/site/reveal";
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
      <PageHeader eyebrow="The Gathering Land" title={site.landHeading} intro={paragraphs(site.landBody)[0]} photo={gallery[15] ?? gallery[0]} />

      <section aria-label="Land at a glance" className="wrap pt-6 lg:pt-14">
        <dl className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[var(--radius-card)] bg-accent p-8 text-accent-ink sm:p-10">
            <dt className="text-sm font-medium opacity-85">{site.landSecuredNote}</dt>
            <dd className="mt-3 font-display text-6xl font-semibold tracking-tight sm:text-7xl">{site.landSecured}</dd>
          </div>
          <div className="card p-8 sm:p-10">
            <dt className="text-sm font-medium text-muted">{site.landTotalNote}</dt>
            <dd className="mt-3 font-display text-6xl font-semibold tracking-tight sm:text-7xl">{site.landTotal}</dd>
          </div>
        </dl>
      </section>

      <section className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <h2 className="text-4xl sm:text-5xl">Vision for the land</h2>
          {vision.length > 0 && (
            <ol className="mt-10 grid">
              {vision.map((v, i) => (
                <li key={v.id} className="flex items-baseline gap-5 border-t border-line py-5">
                  <span className="font-display text-sm font-semibold tabular-nums text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display text-2xl font-medium tracking-tight">{v.title}</span>
                </li>
              ))}
            </ol>
          )}
        </div>
        {site.videoYoutubeId && (
          <div className="mx-auto w-full max-w-[22rem] lg:col-span-4 lg:col-start-9">
            <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
          </div>
        )}
      </section>

      {infra.length > 0 && (
        <section aria-labelledby="infra-h" className="border-y border-line bg-surface py-20 md:py-28">
          <div className="wrap">
            <h2 id="infra-h" className="max-w-[20ch] text-4xl sm:text-5xl">What we are building</h2>
            <ul className="mt-12 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
              {infra.map((b, i) => (
                <Reveal as="li" key={b.id} delay={(i % 3) * 0.06} className="bg-surface p-7">
                  <ListIcon name={b.icon} size={30} className="text-accent-text" />
                  <h3 className="mt-6 text-2xl">{b.title}</h3>
                  {b.body && <p className="mt-2 text-ink-2">{b.body}</p>}
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section className="wrap grid gap-4 py-20 md:grid-cols-[1fr_1fr] md:py-28">
        {gallery[16] && (
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
            <MediaImage media={gallery[16]} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
        )}
        <div className="flex flex-col justify-center rounded-[var(--radius-card)] border border-line bg-surface p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl">Become a Territory Builder</h2>
          <p className="mt-4 max-w-[48ch] text-lg text-ink-2">
            Individuals, churches and organisations can sponsor a specific project on the land, from solar power to seating.
          </p>
          <Link href="/partner#streams" className="btn btn-primary mt-8 self-start">
            See the funding streams <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
