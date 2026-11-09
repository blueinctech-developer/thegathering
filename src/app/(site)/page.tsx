import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarBlank, MapPin } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { ListIcon } from "@/components/icon";
import { Countdown } from "@/components/site/countdown";
import { Reveal } from "@/components/site/reveal";
import { YouTube } from "@/components/site/youtube";
import { BusSection } from "@/components/site/bus-section";
import { PartnerBand } from "@/components/site/partner-band";
import { getEvent, getGallery, getList, getSite, getSpeakers } from "@/lib/content/queries";
import { paragraphs } from "@/lib/content/site-settings";
import { formatDateRange } from "@/lib/format";

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
  const [site, ev, pillars, impact, speakers, gallery] = await Promise.all([
    getSite(),
    getEvent(),
    getList("pillars"),
    getList("impact"),
    getSpeakers(),
    getGallery(),
  ]);
  const [g1, g2, g3, g4, g5] = gallery.slice(1);

  return (
    <>
      {/* Hero: full-bleed photograph, theme set low and left */}
      <section className="relative isolate -mt-px flex min-h-[calc(100dvh-4.25rem)] items-end overflow-hidden bg-ink text-white">
        {ev?.hero && (
          <MediaImage media={ev.hero} fill priority sizes="100vw" className="-z-20 object-cover object-[50%_35%]" alt="" />
        )}
        <div aria-hidden className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgb(var(--scrim)/0.25)_0%,rgb(var(--scrim)/0.1)_35%,rgb(var(--scrim)/0.88)_100%)]" />
        <div className="wrap pb-12 pt-24 md:pb-16">
          {ev && (
            <p className="mb-6 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-medium backdrop-blur-md sm:px-4 sm:text-sm">
              {ev.name} <span aria-hidden className="text-white/50">/</span> {formatDateRange(ev.startsAt, ev.endsAt)}
            </p>
          )}
          <h1 className="max-w-[12ch] text-[3.1rem] font-semibold leading-[0.98] sm:text-7xl lg:text-[6.5rem]">
            {ev?.theme ?? site.siteName}
          </h1>
          <p className="mt-6 max-w-[44ch] text-lg text-white/85 sm:text-xl">{site.heroSummary}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/gathering-2026" className="btn btn-primary">
              Plan your visit <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/partner" className="btn btn-glass">
              Partner with us
            </Link>
          </div>
        </div>
      </section>

      {/* Event facts and countdown */}
      {ev && (
        <section aria-label="Event details" className="border-b border-line bg-surface">
          <div className="wrap grid gap-8 py-8 md:grid-cols-[1fr_1fr_auto] md:items-center md:gap-10">
            <div className="flex items-start gap-4">
              <CalendarBlank size={26} weight="light" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
              <div>
                <p className="text-sm text-muted">When</p>
                <p className="font-display text-xl font-semibold">{formatDateRange(ev.startsAt, ev.endsAt)}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <MapPin size={26} weight="light" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
              <div>
                <p className="text-sm text-muted">Where</p>
                <p className="font-display text-xl font-semibold">{ev.locationLabel}</p>
              </div>
            </div>
            <Countdown startsAt={ev.startsAt.toISOString()} endsAt={ev.endsAt.toISOString()} />
          </div>
        </section>
      )}

      {/* Pillars as a typographic row */}
      {pillars.length > 0 && (
        <section aria-label="What we stand for" className="wrap py-20 md:py-28">
          <ul className="grid gap-12 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line">
            {pillars.map((p, i) => (
              <Reveal as="li" key={p.id} delay={i * 0.08} className="md:px-10 md:first:pl-0 md:last:pr-0">
                <ListIcon name={p.icon} size={30} className="text-accent-text" />
                <h2 className="mt-6 text-5xl lg:text-6xl">{p.title}</h2>
                <p className="mt-3 text-lg text-ink-2">{p.body}</p>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      {/* Introduction: statement plus offset photo pair */}
      <section className="border-y border-line bg-surface py-20 md:py-28">
        <div className="wrap grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6 lg:py-6">
            <h2 className="text-4xl sm:text-5xl">{site.introHeading}</h2>
            <div className="prose-site mt-7 max-w-[60ch] text-lg">
              {paragraphs(site.introBody).map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <blockquote className="mt-10 border-l-2 border-accent pl-6 font-display text-2xl font-medium leading-snug tracking-tight sm:text-[1.7rem]">
              {site.belief}
            </blockquote>
            <Link href="/about" className="link mt-8 inline-flex items-center gap-2">
              Read our story <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="relative grid grid-cols-5 gap-4 lg:col-span-6">
            {g1 && (
              <Reveal className="relative col-span-3 aspect-[3/4] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
                <MediaImage media={g1} fill sizes="(min-width: 1024px) 30vw, 60vw" className="object-cover" />
              </Reveal>
            )}
            {g2 && (
              <Reveal delay={0.12} className="relative col-span-2 mt-16 aspect-[3/5] overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
                <MediaImage media={g2} fill sizes="(min-width: 1024px) 20vw, 40vw" className="object-cover" />
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Outreach bento */}
      <section aria-labelledby="impact-h" className="wrap py-20 md:py-28">
        <h2 id="impact-h" className="max-w-[18ch] text-4xl sm:text-5xl">
          Prayer that moves into practical care
        </h2>
        <div className="mt-12 grid auto-rows-[minmax(14rem,auto)] gap-4 md:grid-cols-6">
          <Link
            href="/ministries"
            className="group relative isolate flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-ink p-7 text-white md:col-span-4 md:row-span-2"
          >
            {g3 && <MediaImage media={g3} fill sizes="(min-width: 768px) 60vw, 100vw" className="-z-10 object-cover opacity-80 transition-transform duration-700 group-hover:scale-[1.03]" />}
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <h3 className="text-3xl sm:text-4xl">Medical outreach</h3>
            <p className="mt-3 max-w-[46ch] text-white/85">{site.medicalBody}</p>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold">
              {site.medicalTarget} <ArrowUpRight size={16} aria-hidden />
            </span>
          </Link>
          <div className="flex flex-col justify-between rounded-[var(--radius-card)] bg-accent p-7 text-accent-ink md:col-span-2">
            <h3 className="text-2xl">Heart of Compassion</h3>
            <p className="mt-4 opacity-90">{site.compassionBody}</p>
          </div>
          <Link
            href="/land"
            className="group relative isolate flex flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-ink p-7 text-white md:col-span-2"
          >
            {g4 && <MediaImage media={g4} fill sizes="(min-width: 768px) 30vw, 100vw" className="-z-10 object-cover opacity-70 transition-transform duration-700 group-hover:scale-[1.03]" />}
            <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 to-black/10" />
            <h3 className="text-2xl">The Gathering Land</h3>
            <p className="mt-2 text-white/85">
              {site.landTotal} in Ido, Oyo State. {site.landSecured} secured.
            </p>
          </Link>
        </div>
        <div className="mt-4">
          {impact.length > 0 && (
            <dl className="grid gap-6 rounded-[var(--radius-card)] border border-line bg-surface p-7 sm:grid-cols-3">
              {impact.map((s) => (
                <div key={s.id}>
                  <dt className="sr-only">{s.body}</dt>
                  <dd>
                    <span className="block font-display text-5xl font-semibold tracking-tight tabular-nums lg:text-6xl">{s.title}</span>
                    <span className="mt-2 block text-ink-2">{s.body}</span>
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Speakers: one marquee of names, linking to the full lineup */}
      {speakers.length > 0 && (
        <section aria-labelledby="speakers-h" className="border-y border-line bg-surface py-16 md:py-20">
          <div className="wrap flex flex-wrap items-end justify-between gap-6">
            <h2 id="speakers-h" className="text-3xl sm:text-4xl">
              Ministering at {ev?.name ?? site.siteName}
            </h2>
            <Link href="/gathering-2026#speakers" className="link inline-flex items-center gap-2">
              See the lineup <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
          <div className="marquee relative mt-10 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            <ul className="marquee-track flex w-max gap-12" aria-label="Speakers">
              {[...speakers, ...speakers].map((s, i) => (
                <li key={`${s.id}-${i}`} aria-hidden={i >= speakers.length} className="flex items-baseline gap-3 whitespace-nowrap">
                  <span className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{s.name}</span>
                  <span className="text-sm text-muted">{s.role}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <BusSection />

      {/* Video beside a short note */}
      {site.videoYoutubeId && (
        <section aria-labelledby="video-h" className="border-t border-line bg-surface-2/50 py-20 md:py-28">
          <div className="wrap grid items-center gap-12 md:grid-cols-[1fr_minmax(0,22rem)] lg:gap-20">
            <div>
              <h2 id="video-h" className="max-w-[18ch] text-4xl sm:text-5xl">{site.videoTitle}</h2>
              <p className="mt-5 max-w-[52ch] text-lg text-ink-2">
                Development has begun on land secured for future Gatherings in Ido, Oyo State.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/land" className="btn btn-secondary">
                  About the land
                </Link>
                {site.youtube && (
                  <a href={site.youtube} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    YouTube channel <ArrowUpRight size={16} aria-hidden />
                  </a>
                )}
              </div>
            </div>
            <div className="mx-auto w-full max-w-[22rem]">
              <YouTube id={site.videoYoutubeId} title={site.videoTitle} vertical />
            </div>
          </div>
        </section>
      )}

      {/* Photo strip */}
      {g5 && (
        <section aria-label="Photos from The Gathering" className="wrap grid grid-cols-2 gap-4 py-20 md:grid-cols-4 md:py-28">
          {gallery.slice(6, 10).map((m, i) => (
            <Reveal key={m.id} delay={i * 0.06} className={`relative overflow-hidden rounded-[var(--radius-card)] bg-surface-2 ${i % 2 ? "aspect-[3/4] md:mt-12" : "aspect-[3/4]"}`}>
              <MediaImage media={m} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
            </Reveal>
          ))}
          <div className="col-span-2 md:col-span-4">
            <Link href="/media" className="link inline-flex items-center gap-2">
              More photos <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </section>
      )}

      <PartnerBand />
    </>
  );
}
