import type { Metadata } from "next";
import { HandHeart, Stethoscope, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { Reveal } from "@/components/site/reveal";
import { ArrowLink, PageHero, SectionHead } from "@/components/site/ui";
import { getGallery, getList, getSite } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Ministries and outreach",
  description: "Medical outreach, community feeding and family engagement alongside three days of prayer and worship.",
};

export default async function MinistriesPage() {
  const [site, medical, gallery] = await Promise.all([getSite(), getList("medical"), getGallery()]);
  const photo = (i: number) => gallery[i] ?? gallery[0] ?? null;

  return (
    <>
      <PageHero
        label="Ministries and outreach"
        title="Serving both soul and body"
        photo={photo(6)}
        intro="The Gathering is a spiritual conference and a programme of community care. Prayer, compassion and practical support go together."
      />

      {/* Medical outreach: the largest programme */}
      <section aria-labelledby="medical-h" className="bg-band py-24 md:py-32">
        <div className="wrap">
          <div className="card grid gap-10 p-6 sm:p-10 lg:grid-cols-2 lg:items-center lg:p-14">
            <div>
              <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">
                <Stethoscope size={24} weight="light" aria-hidden />
              </span>
              <h2 id="medical-h" className="t-section mt-6">Medical outreach</h2>
              <p className="t-lead mt-5">{site.medicalBody}</p>
              <p className="mt-6 inline-flex items-baseline gap-2 rounded-full bg-ember-tint px-5 py-2.5">
                <span className="font-medium text-ember-deep">{site.medicalTarget}</span>
                <span className="text-sm text-ink-2">reached with free care</span>
              </p>
            </div>
            <div className="panel-stripes rounded-[1.5rem] p-4 sm:p-5">
              {photo(13) && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.1rem] ring-4 ring-card">
                  <MediaImage media={photo(13)!} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                </div>
              )}
              {medical.length > 0 && (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {medical.map((m) => (
                    <li key={m.id} className="rounded-xl bg-card px-4 py-3 text-sm">{m.title}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <Reveal className="card flex flex-col p-8 sm:p-10">
              <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">
                <HandHeart size={24} weight="light" aria-hidden />
              </span>
              <h2 className="mt-8 text-[1.9rem] tracking-tight">Heart of Compassion</h2>
              <p className="mt-3 text-ink-2">{site.compassionBody}</p>
              {photo(14) && (
                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-band">
                  <MediaImage media={photo(14)!} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
              )}
            </Reveal>
            <Reveal delay={0.08} className="card flex flex-col p-8 sm:p-10">
              <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">
                <UsersThree size={24} weight="light" aria-hidden />
              </span>
              <h2 className="mt-8 text-[1.9rem] tracking-tight">Family and community</h2>
              <p className="mt-3 text-ink-2">{site.communityBody}</p>
              {photo(15) && (
                <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-band">
                  <MediaImage media={photo(15)!} fill sizes="(min-width: 768px) 45vw, 100vw" className="object-cover" />
                </div>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="land-h" className="wrap py-24 text-center md:py-32">
        <SectionHead
          id="land-h"
          title="A permanent home for this work"
          intro={`${site.landTotal} in Ido, Oyo State, with ${site.landSecured} already secured, will host future conferences, outreach and training.`}
        />
        <div className="mt-8">
          <ArrowLink href="/land">The Gathering Land</ArrowLink>
        </div>
      </section>
    </>
  );
}
