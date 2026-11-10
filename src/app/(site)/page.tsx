import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import { Flame, HandHeart, MapPin, Stethoscope } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { ListIcon } from "@/components/icon";
import { BusSection } from "@/components/site/bus-section";
import { HomeHero } from "@/components/site/home-hero";
import { FaqSection } from "@/components/site/faq";
import { Reveal } from "@/components/site/reveal";
import { ArrowLink, SectionHead } from "@/components/site/ui";
import { YouTube } from "@/components/site/youtube";
import type { MediaRef } from "@/lib/content/queries";
import { getEvent, getFundingStreams, getGallery, getList, getSite, getSlotImages, getSpeakers } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";
import { money } from "@/lib/format";

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
  const [site, ev, impact, speakers, gallery, expect, medical, landVision, tiers, streams, faqs, highlights, slots] = await Promise.all([
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
    getList("highlights"),
    getSlotImages(),
  ]);
  const photo = (i: number) => gallery[i] ?? gallery[0] ?? null;
  const heroFlyer = ev?.flyer ?? ev?.hero ?? null;
  const totalNgn = streams.reduce((t, s) => t + s.amountNgn, 0);

  // Only real photos that show what the card describes. The library has no medical, feeding or land
  // photos yet, so those use an icon panel, and the land uses a frame from the ministry's land video.
  const landArt: Visual | null = site.videoYoutubeId
    ? { kind: "url", src: `https://i.ytimg.com/vi/${site.videoYoutubeId}/oardefault.jpg`, alt: "Aerial view of The Gathering Land", position: "50% 100%", zoomFromBottom: 1.45 }
    : null;
  const media = (i: number): Visual | null => (photo(i) ? { kind: "media", media: photo(i)! } : null);

  return (
    <>
      <section className="overflow-hidden">
        <HomeHero ev={ev} site={site} art={heroFlyer} speakers={speakers} />


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
              visual={media(1)}
            />
            <FeatureCard
              icon={<Stethoscope size={26} weight="light" />}
              title="Medical outreach"
              body={site.medicalBody}
              points={medical.slice(0, 3).map((m) => m.title)}
              href="/ministries"
              linkLabel="See our outreach"
              visual={slots.medical ? { kind: "media", media: slots.medical } : { kind: "icon", icon: "medical", lines: [site.medicalTarget, "Free screening and medication"] }}
            />
            <FeatureCard
              icon={<HandHeart size={26} weight="light" />}
              title="Heart of Compassion"
              body={site.compassionBody}
              points={["Food distribution for vulnerable families", "Practical support for those in need", "Care during and beyond the conference"]}
              href="/ministries"
              linkLabel="How we serve"
              visual={slots.compassion ? { kind: "media", media: slots.compassion } : { kind: "icon", icon: "compassion", lines: ["Community feeding", "During and beyond the conference"] }}
            />
            <FeatureCard
              icon={<MapPin size={26} weight="light" />}
              title="The Gathering Land"
              body={`${site.landTotal} in Ido, Oyo State, with ${site.landSecured} already secured. A permanent home for the work.`}
              points={landVision.slice(0, 3).map((v) => v.title)}
              href="/land"
              linkLabel="See the vision"
              visual={landArt}
            />
          </div>
        </div>
      </section>

      {/* At a glance (the preview's six facts) */}
      {highlights.length > 0 && (
        <section aria-labelledby="glance-h" className="wrap pt-24 md:pt-32">
          <SectionHead id="glance-h" title={site.introHeading} intro={site.introBody} />
          <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map((h, i) => (
              <Reveal as="li" key={h.id} delay={(i % 3) * 0.05} className="card-line flex items-start gap-4 p-6">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ember-tint text-ember-deep">
                  <ListIcon name={h.icon} size={22} />
                </span>
                <span>
                  <span className="block text-lg font-semibold tracking-tight">{h.title}</span>
                  <span className="text-ink-2">{h.body}</span>
                </span>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

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
          </div>
          <ul className="wrap mt-10 flex flex-wrap justify-center gap-2" aria-label="Speakers">
            {speakers.map((s) => (
              <li key={s.id} className="flex items-baseline gap-2 rounded-full bg-card px-5 py-3 ring-1 ring-line">
                <span className="font-medium tracking-tight">{s.name}</span>
                <span className="text-sm text-ink-3">{s.role}</span>
              </li>
            ))}
          </ul>
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
              <span className="t-display block tabular-nums text-gold">{site.fundingTotalNgn || money.ngn(totalNgn)}</span>
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
            <Link href="/partner" className="pill pill-gold pill-lg">Become a partner</Link>
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
  visual,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  points: string[];
  href: string;
  linkLabel: string;
  visual: Visual | null;
}) {
  return (
    <Reveal className="card group flex flex-col overflow-hidden p-3">
      {visual && (
        <div className="relative aspect-[16/10] overflow-hidden rounded-[1.4rem] bg-band">
          <VisualFill visual={visual} sizes="(min-width: 1024px) 40vw, 100vw" />
          {visual.kind !== "icon" && (
            <span className="absolute left-4 top-4 grid size-12 place-items-center rounded-full bg-card text-ember-deep shadow-lg">{icon}</span>
          )}
        </div>
      )}
      <div className="flex flex-1 flex-col p-4 pt-7 sm:p-7">
      <h3 className="text-[1.9rem]">{title}</h3>
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
      </div>
    </Reveal>
  );
}

type Visual =
  | { kind: "media"; media: MediaRef }
  | { kind: "url"; src: string; alt: string; position?: string; zoomFromBottom?: number }
  | { kind: "icon"; icon: "medical" | "compassion"; lines: string[] };

/** Fills its (relative, sized) parent with a photo, a remote frame, or a maroon icon panel. */
function VisualFill({ visual, sizes }: { visual: Visual; sizes: string }) {
  if (visual.kind === "media") {
    return <MediaImage media={visual.media} fill sizes={sizes} className="object-cover transition-transform duration-700 group-hover:scale-[1.03]" />;
  }
  if (visual.kind === "url") {
    return (
      <Image
        src={visual.src}
        alt={visual.alt}
        fill
        sizes={sizes}
        className="object-cover"
        style={{
          objectPosition: visual.position ?? "50% 50%",
          // Crops into the lower part of the frame (used to keep a video's burned-in caption out of view).
          ...(visual.zoomFromBottom ? { transform: `scale(${visual.zoomFromBottom})`, transformOrigin: "50% 100%" } : {}),
        }}
      />
    );
  }
  const Icon = visual.icon === "medical" ? Stethoscope : HandHeart;
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-ember p-6 text-center text-white">
      <span aria-hidden className="absolute inset-0 bg-[radial-gradient(70%_70%_at_50%_0%,rgb(213_161_60/0.28),transparent_70%)]" />
      <Icon size={64} weight="light" className="relative text-gold" aria-hidden />
      <ul className="relative flex flex-wrap justify-center gap-2">
        {visual.lines.map((l) => (
          <li key={l} className="rounded-full bg-white/12 px-3 py-1.5 text-sm ring-1 ring-white/20">{l}</li>
        ))}
      </ul>
    </div>
  );
}
