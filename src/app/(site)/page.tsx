import type { Metadata } from "next";
import Link from "next/link";
import { Flame, HandHeart, MapPin, Stethoscope } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { BusSection } from "@/components/site/bus-section";
import { Countdown } from "@/components/site/countdown";
import { FaqSection } from "@/components/site/faq";
import { Reveal } from "@/components/site/reveal";
import { ArrowLink, SectionHead } from "@/components/site/ui";
import { YouTube } from "@/components/site/youtube";
import { getEvent, getFundingStreams, getGallery, getList, getSite, getSpeakers } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";
import { formatDateRange, money } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const [site, ev] = await Promise.all([getSite(), getEvent()]);
  const title = ev ? `${ev.name}: ${ev.theme}` : site.siteName;
  return {
    title: { absolute: title },
    description: site.metaDescription,
    openGraph: { title, description: site.metaDescription, images: ev?.hero ? [`/media/${ev.hero.key}`] : undefined },
  };
}

export default async function HomePage() {
  const [site, ev, impact, speakers, gallery, expect, medical, landVision, tiers, streams, faqs] = await Promise.all([
    getSite(),
    getEvent(),
    getList("impact"),
    getSpeakers(),
    getGallery(),
    getList("expect"),
    getList("medical"),
    getList("landVision"),
    getList("partnerTiers"),
    getFundingStreams(),
    getList("faqs"),
  ]);
  const photo = (i: number) => gallery[i] ?? gallery[0] ?? null;
  const totalNgn = streams.reduce((t, s) => t + s.amountNgn, 0);

  const experiences = [
    { label: "Worship and prayer", title: "Three days in the presence of God", img: photo(0) },
    { label: "Medical outreach", title: `Free care for ${site.medicalTarget.toLowerCase()}`, img: photo(2) },
    { label: "Heart of Compassion", title: "Food and support for families", img: photo(5) },
    { label: "Ministry", title: "Anointed teaching and healing", img: photo(10) },
    { label: "The Gathering Land", title: `${site.landTotal} for future generations`, img: photo(12) },
  ];

  return (
    <>
      {/* Hero */}
      <section className="panel-glow overflow-hidden">
        <div className="wrap pb-14 pt-16 text-center md:pt-24">
          <h1 className="t-hero mx-auto max-w-[11ch]">{ev ? `${ev.theme}.` : site.siteName}</h1>
          <p className="t-lead mx-auto mt-7 max-w-[44ch]">{site.heroSummary}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/gathering-2026" className="pill pill-ember pill-lg">Plan your visit</Link>
            <Link href="/partner" className="pill pill-line pill-lg">Partner with us</Link>
          </div>
          {ev && (
            <div className="mt-12 flex flex-col items-center gap-5">
              <p className="text-sm text-ink-3">
                {ev.name}, {formatDateRange(ev.startsAt, ev.endsAt)}. {ev.locationLabel}.
              </p>
              <Countdown startsAt={ev.startsAt.toISOString()} endsAt={ev.endsAt.toISOString()} />
            </div>
          )}
        </div>

        {/* Experience cards, scrolling sideways */}
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[max(1rem,calc((100vw_-_1280px)/2_+_2rem))] scroll-px-[max(1rem,calc((100vw_-_1280px)/2_+_2rem))] pb-20">
          {experiences.map((x, i) => (
            <Reveal key={x.label} delay={i * 0.06} className="w-[82vw] max-w-[26rem] shrink-0 snap-start sm:w-[24rem]">
              <article className="panel-stripes flex h-full flex-col rounded-[1.75rem] p-5 pt-6">
                <p className="t-label px-1">{x.label}</p>
                <h2 className="mt-2 px-1 text-[1.35rem] tracking-tight">{x.title}</h2>
                {x.img && (
                  <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[1.25rem] bg-card shadow-[0_18px_40px_-24px_rgb(23_20_15/0.45)] ring-4 ring-card">
                    <MediaImage media={x.img} fill sizes="(min-width: 640px) 24rem, 82vw" className="object-cover" />
                  </div>
                )}
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* What happens at The Gathering: large white cards on a grey band */}
      <section aria-labelledby="what-h" className="bg-band py-24 md:py-32">
        <div className="wrap">
          <SectionHead
            id="what-h"
            title="Prayer that moves into practical care"
            intro={site.belief}
          />
          <div className="mt-16 grid gap-5 lg:grid-cols-2">
            <FeatureCard
              icon={<Flame size={26} weight="light" />}
              title="Worship, prayer and revival"
              body={paragraphs(site.introBody)[0]}
              points={expect.slice(0, 3).map((e) => e.title)}
              href="/gathering-2026"
              linkLabel="See the programme"
              img={photo(1)}
            />
            <FeatureCard
              icon={<Stethoscope size={26} weight="light" />}
              title="Medical outreach"
              body={site.medicalBody}
              points={medical.slice(0, 3).map((m) => m.title)}
              href="/ministries"
              linkLabel="See our outreach"
              img={photo(3)}
            />
            <FeatureCard
              icon={<HandHeart size={26} weight="light" />}
              title="Heart of Compassion"
              body={site.compassionBody}
              points={["Community feeding during the conference", "Practical support for vulnerable families", "Care that continues beyond the three days"]}
              href="/ministries"
              linkLabel="How we serve"
              img={photo(7)}
            />
            <FeatureCard
              icon={<MapPin size={26} weight="light" />}
              title="The Gathering Land"
              body={`${site.landTotal} in Ido, Oyo State, with ${site.landSecured} already secured. A permanent home for the work.`}
              points={landVision.slice(0, 3).map((v) => v.title)}
              href="/land"
              linkLabel="See the vision"
              img={photo(12)}
            />
          </div>
        </div>
      </section>

      {/* Impact figures */}
      {impact.length > 0 && (
        <section aria-labelledby="impact-h" className="wrap py-24 md:py-32">
          <SectionHead id="impact-h" title="Measured in transformed lives" />
          <dl className="mt-16 grid gap-12 text-center sm:grid-cols-3">
            {impact.map((s, i) => (
              <Reveal key={s.id} delay={i * 0.08} className="flex flex-col-reverse">
                <dt className="mt-3 text-ink-2">{s.body}</dt>
                <dd className="t-display tabular-nums">{s.title}</dd>
              </Reveal>
            ))}
          </dl>
        </section>
      )}

      {/* Speakers */}
      {speakers.length > 0 && (
        <section aria-labelledby="speakers-h" className="pb-24 md:pb-32">
          <div className="wrap">
            <SectionHead id="speakers-h" title={`Ministering at ${ev?.name ?? site.siteName}`} intro={ev ? `Servants of God ministering under the theme ${ev.theme}.` : undefined} />
            {ev?.flyer && (
              <Reveal className="mt-14 overflow-hidden rounded-[1.75rem] bg-band p-2 sm:p-3">
                <MediaImage media={ev.flyer} sizes="(min-width: 1280px) 1240px, 100vw" className="h-auto w-full rounded-[1.35rem]" />
              </Reveal>
            )}
          </div>
          <div className="marquee relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <ul className="marquee-track flex w-max gap-3" aria-label="Speakers">
              {[...speakers, ...speakers].map((s, i) => (
                <li key={`${s.id}-${i}`} aria-hidden={i >= speakers.length} className="flex items-center gap-2 whitespace-nowrap rounded-full bg-band px-5 py-3">
                  <span className="text-lg tracking-tight">{s.name}</span>
                  <span className="text-sm text-ink-3">{s.role}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-10 text-center">
            <ArrowLink href="/gathering-2026#speakers">Full lineup</ArrowLink>
          </div>
        </section>
      )}

      <BusSection />

      {/* Story and video */}
      <section aria-labelledby="why-h" className="wrap grid items-center gap-14 pb-24 md:pb-32 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <div>
          <h2 id="why-h" className="t-section max-w-[16ch]">{site.whyHeading}</h2>
          <div className="t-lead prose-site mt-6 max-w-[54ch]">
            {paragraphs(site.whyBody).map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <div className="mt-8">
            <ArrowLink href="/about">Our story</ArrowLink>
          </div>
        </div>
        {site.videoYoutubeId && (
          <div className="mx-auto w-full max-w-[22rem] rounded-[2rem] bg-band p-3">
            <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
            <p className="px-2 pb-1 pt-3 text-center text-sm text-ink-2">{site.videoTitle}</p>
          </div>
        )}
      </section>

      {/* Partnership: the one dark section */}
      <section aria-labelledby="partner-h" className="bg-ground text-white">
        <div className="wrap py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h2 id="partner-h" className="t-section">{site.partnerHeading}</h2>
            <p className="mx-auto mt-5 max-w-[54ch] text-lg text-white/70">{site.partnerIntro}</p>
          </div>
          {totalNgn > 0 && (
            <p className="mt-14 text-center">
              <span className="t-display block tabular-nums text-ember">{money.ngn(totalNgn)}</span>
              <span className="mt-2 block text-white/60">to build, equip and serve at {ev?.name ?? site.siteName}</span>
            </p>
          )}
          {tiers.length > 0 && (
            <ul className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tiers.slice(0, 3).map((t) => (
                <li key={t.id} className="rounded-[1.5rem] bg-white/[0.06] p-6 ring-1 ring-white/10">
                  <h3 className="text-xl">{t.title}</h3>
                  <p className="mt-2 text-sm text-white/65">{t.body}</p>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <Link href="/partner" className="pill pill-ember pill-lg">Become a partner</Link>
            <Link href="/partner#streams" className="pill pill-light pill-lg">See funding streams</Link>
          </div>
        </div>
      </section>

      <FaqSection items={faqs} />
    </>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  points,
  href,
  linkLabel,
  img,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  points: string[];
  href: string;
  linkLabel: string;
  img: Parameters<typeof MediaImage>[0]["media"] | null;
}) {
  return (
    <Reveal className="card flex flex-col p-7 sm:p-10">
      <div className="flex items-start justify-between gap-6">
        <span className="grid size-12 place-items-center rounded-full bg-ember-tint text-ember-deep">{icon}</span>
        {img && (
          <div className="relative -mr-2 -mt-2 aspect-[4/3] w-40 overflow-hidden rounded-[1.25rem] sm:w-48">
            <MediaImage media={img} fill sizes="12rem" className="object-cover" />
          </div>
        )}
      </div>
      <h3 className="mt-8 text-[1.75rem] tracking-tight">{title}</h3>
      <p className="mt-3 text-ink-2">{body}</p>
      {points.length > 0 && (
        <ul className="dots mt-6">
          {points.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
      <div className="mt-auto pt-8">
        <ArrowLink href={href}>{linkLabel}</ArrowLink>
      </div>
    </Reveal>
  );
}
