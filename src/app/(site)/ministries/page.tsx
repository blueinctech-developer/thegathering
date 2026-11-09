import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, HandHeart, Stethoscope, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { PageHeader } from "@/components/site/page-header";
import { PartnerBand } from "@/components/site/partner-band";
import { Reveal } from "@/components/site/reveal";
import { getGallery, getList, getSite } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Ministries and outreach",
  description: "Medical outreach, community feeding and family engagement alongside three days of prayer and worship.",
};

export default async function MinistriesPage() {
  const [site, medical, gallery] = await Promise.all([getSite(), getList("medical"), getGallery()]);
  const header = gallery[12] ?? gallery[0];
  const med = gallery[13] ?? gallery[1];
  const comm = gallery[14] ?? gallery[2];

  return (
    <>
      <PageHeader
        eyebrow="Ministries and outreach"
        title="Serving both soul and body"
        intro="The Gathering is a spiritual conference and a programme of community care. Prayer, compassion and practical support go together."
        photo={header}
      />

      {/* Medical: the largest programme, given the widest treatment */}
      <section aria-labelledby="medical-h" className="wrap py-20 md:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <Stethoscope size={34} weight="light" className="text-accent-text" aria-hidden />
            <h2 id="medical-h" className="mt-5 text-4xl sm:text-5xl">Medical outreach</h2>
            <p className="mt-6 max-w-[56ch] text-lg text-ink-2">{site.medicalBody}</p>
            <p className="mt-8 inline-flex items-baseline gap-3 rounded-full bg-accent-soft px-5 py-2.5">
              <span className="font-display text-xl font-semibold text-accent-text">{site.medicalTarget}</span>
              <span className="text-sm text-ink-2">reached with free care</span>
            </p>
          </div>
          {medical.length > 0 && (
            <ul className="grid content-start gap-x-8 sm:grid-cols-2 lg:col-span-6">
              {medical.map((m) => (
                <li key={m.id} className="flex gap-3 border-t border-line py-4">
                  <Check size={20} className="mt-1 shrink-0 text-accent-text" aria-hidden />
                  <span className="font-medium">{m.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {med && (
          <Reveal className="relative mt-14 aspect-[21/9] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
            <MediaImage media={med} fill sizes="(min-width: 1320px) 1240px, 100vw" className="object-cover" />
          </Reveal>
        )}
      </section>

      {/* Compassion and community: paired panels */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="wrap grid gap-4 md:grid-cols-2">
          <article className="flex flex-col rounded-[var(--radius-card)] bg-accent p-8 text-accent-ink sm:p-10">
            <HandHeart size={34} weight="light" aria-hidden />
            <h2 className="mt-auto pt-16 text-3xl sm:text-4xl">Heart of Compassion</h2>
            <p className="mt-4 max-w-[46ch] opacity-90">{site.compassionBody}</p>
          </article>
          <article className="relative isolate flex min-h-[22rem] flex-col overflow-hidden rounded-[var(--radius-card)] bg-ink p-8 text-white sm:p-10">
            {comm && <MediaImage media={comm} fill sizes="(min-width: 768px) 50vw, 100vw" className="-z-10 object-cover opacity-60" />}
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
            <UsersThree size={34} weight="light" aria-hidden />
            <h2 className="mt-auto pt-16 text-3xl sm:text-4xl">Family and community</h2>
            <p className="mt-4 max-w-[46ch] text-white/85">{site.communityBody}</p>
          </article>
        </div>
      </section>

      <section aria-labelledby="land-teaser-h" className="wrap flex flex-col gap-6 py-20 md:flex-row md:items-end md:justify-between md:py-24">
        <div>
          <h2 id="land-teaser-h" className="max-w-[20ch] text-4xl sm:text-5xl">A permanent home for this work</h2>
          <p className="mt-5 max-w-[56ch] text-lg text-ink-2">
            {site.landTotal} in Ido, Oyo State, with {site.landSecured} already secured, will host future conferences, outreach and training.
          </p>
        </div>
        <Link href="/land" className="btn btn-secondary self-start md:self-end">
          The Gathering Land <ArrowRight size={18} aria-hidden />
        </Link>
      </section>

      <PartnerBand />
    </>
  );
}
