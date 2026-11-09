import type { Metadata } from "next";
import { ArrowUpRight, CalendarBlank, MapPin, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { BusSection } from "@/components/site/bus-section";
import { Countdown } from "@/components/site/countdown";
import { FaqSection } from "@/components/site/faq";
import { Reveal } from "@/components/site/reveal";
import { PageHero, SectionHead } from "@/components/site/ui";
import { getEvent, getList, getProgramme, getSite, getSpeakers } from "@/lib/content/queries";
import { formatDateRange, formatDay } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const ev = await getEvent();
  if (!ev) return { title: "The Gathering" };
  return {
    title: { absolute: `${ev.name}: ${ev.theme}` },
    description: `${ev.name}, ${formatDateRange(ev.startsAt, ev.endsAt)}, ${ev.locationLabel}. Programme, speakers and free transport.`,
  };
}

function initials(name: string) {
  return name
    .replace(/^(Pst|Rev|Bishop|Pro|Min|Dr|Pastor)\.?\s+/i, "")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("");
}

export default async function GatheringPage() {
  const [site, ev, days, speakers, expect, faqs] = await Promise.all([
    getSite(),
    getEvent(),
    getProgramme(),
    getSpeakers(),
    getList("expect"),
    getList("faqs"),
  ]);

  const jsonLd = ev && {
    "@context": "https://schema.org",
    "@type": "Event",
    name: `${ev.name}: ${ev.theme}`,
    startDate: ev.startsAt.toISOString(),
    endDate: ev.endsAt.toISOString(),
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    isAccessibleForFree: true,
    description: ev.summary,
    location: { "@type": "Place", name: ev.venueName || ev.locationLabel, address: ev.venueAddress || ev.locationLabel },
    organizer: { "@type": "Organization", name: site.orgName, url: process.env.NEXT_PUBLIC_SITE_URL },
    performer: speakers.map((s) => ({ "@type": "Person", name: s.name })),
  };

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <PageHero label={ev?.name} title={ev ? `${ev.theme}.` : "The Gathering"} intro={ev?.summary}>
        {ev && <Countdown startsAt={ev.startsAt.toISOString()} endsAt={ev.endsAt.toISOString()} />}
      </PageHero>

      {ev && (
        <section aria-label="Key details" className="bg-band py-16">
          <dl className="wrap grid gap-4 md:grid-cols-3">
            <div className="card p-7">
              <dt className="flex items-center gap-2 text-sm text-ink-3"><CalendarBlank size={18} aria-hidden /> Dates</dt>
              <dd className="mt-3 text-2xl tracking-tight">{formatDateRange(ev.startsAt, ev.endsAt)}</dd>
              <dd className="mt-1 text-ink-2">Three days, starting each morning</dd>
            </div>
            <div className="card p-7">
              <dt className="flex items-center gap-2 text-sm text-ink-3"><MapPin size={18} aria-hidden /> Venue</dt>
              <dd className="mt-3 text-2xl tracking-tight">{ev.venueName || ev.locationLabel}</dd>
              {ev.venueAddress && <dd className="mt-1 text-ink-2">{ev.venueAddress}</dd>}
              {ev.mapUrl && (
                <dd className="mt-3">
                  <a className="link inline-flex items-center gap-1 text-sm" href={ev.mapUrl} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps <ArrowUpRight size={14} aria-hidden />
                  </a>
                </dd>
              )}
            </div>
            <div className="card p-7">
              <dt className="flex items-center gap-2 text-sm text-ink-3"><UsersThree size={18} aria-hidden /> Entry</dt>
              <dd className="mt-3 text-2xl tracking-tight">Free, open to all</dd>
              <dd className="mt-1 text-ink-2">Interdenominational. Everyone is welcome.</dd>
            </div>
          </dl>
        </section>
      )}

      {days.length > 0 && (
        <section id="programme" aria-labelledby="programme-h" className="wrap py-24 md:py-32">
          <SectionHead id="programme-h" title="Programme" intro={site.programmeNote} />
          <ol className="mt-16 grid gap-4 lg:grid-cols-3">
            {days.map((d, i) => (
              <Reveal as="li" key={d.id} delay={i * 0.08} className="panel-stripes flex flex-col rounded-[1.75rem] p-5">
                <div className="flex items-baseline justify-between px-2 pt-1">
                  <span className="t-label">{d.label}</span>
                  <time dateTime={d.day} className="text-sm text-ink-2">{formatDay(d.day)}</time>
                </div>
                {d.title && <h3 className="mt-3 px-2 text-2xl">{d.title}</h3>}
                <ul className="card mt-5 flex-1 divide-y divide-line px-5 py-2">
                  {d.items.map((it) => (
                    <li key={it.id} className="flex gap-4 py-3.5">
                      {it.time && <span className="w-16 shrink-0 tabular-nums text-ink-3">{it.time}</span>}
                      <span>{it.title}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </section>
      )}

      {speakers.length > 0 && (
        <section id="speakers" aria-labelledby="speakers-h" className="bg-band py-24 md:py-32">
          <div className="wrap">
            <SectionHead
              id="speakers-h"
              title="Ministers and speakers"
              intro={ev ? `Ministering under the theme ${ev.theme}${ev.subtitle ? `, ${ev.subtitle}` : ""}.` : undefined}
            />
            {ev?.flyer && (
              <div className="card mt-14 p-2 sm:p-3">
                <MediaImage media={ev.flyer} sizes="(min-width: 1280px) 1240px, 100vw" className="h-auto w-full rounded-[1.35rem]" />
              </div>
            )}
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {speakers.map((s) => (
                <li key={s.id} className="card flex items-center gap-4 p-4 lg:flex-col lg:items-start lg:p-6">
                  {s.photo ? (
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-band">
                      <MediaImage media={s.photo} fill sizes="56px" className="object-cover" />
                    </span>
                  ) : (
                    <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-ember-tint text-lg text-ember-deep">
                      {initials(s.name)}
                    </span>
                  )}
                  <span>
                    <span className="block text-lg leading-snug tracking-tight">{s.name}</span>
                    {s.role && <span className="text-sm text-ink-3">{s.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {expect.length > 0 && (
        <section aria-labelledby="expect-h" className="wrap py-24 md:py-32">
          <SectionHead id="expect-h" title="What to expect" />
          <ul className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {expect.map((x, i) => (
              <Reveal as="li" key={x.id} delay={(i % 3) * 0.05} className="card-line flex flex-col gap-5 p-6">
                <span className="grid size-9 place-items-center rounded-full bg-ember-tint text-sm tabular-nums text-ember-deep">{i + 1}</span>
                <span className="text-lg leading-snug tracking-tight">{x.title}</span>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <BusSection detailed />
      <FaqSection items={faqs} />
    </>
  );
}
