import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarBlank, Check, MapPin, UsersThree } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { BusSection } from "@/components/site/bus-section";
import { PageHeader } from "@/components/site/page-header";
import { PartnerBand } from "@/components/site/partner-band";
import { Reveal } from "@/components/site/reveal";
import { getEvent, getGallery, getList, getProgramme, getSite, getSpeakers } from "@/lib/content/queries";
import { formatDateRange, formatDay } from "@/lib/format";

export async function generateMetadata(): Promise<Metadata> {
  const ev = await getEvent();
  if (!ev) return { title: "The Gathering" };
  return {
    title: { absolute: `${ev.name}: ${ev.theme}` },
    description: `${ev.name}, ${formatDateRange(ev.startsAt, ev.endsAt)}, ${ev.locationLabel}. Programme, speakers and free transport.`,
  };
}

export default async function GatheringPage() {
  const [site, ev, days, speakers, expect, gallery] = await Promise.all([
    getSite(),
    getEvent(),
    getProgramme(),
    getSpeakers(),
    getList("expect"),
    getGallery(),
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
      <PageHeader eyebrow={ev?.subtitle || undefined} title={ev ? `${ev.name}: ${ev.theme}` : "The Gathering"} intro={ev?.summary} photo={gallery[2] ?? ev?.hero}>
        <a href="#programme" className="btn btn-primary">See the programme</a>
        <a href="#bus" className="btn btn-secondary">Free bus details</a>
      </PageHeader>

      {ev && (
        <section aria-label="Key details" className="wrap pb-6 pt-6 lg:pt-14">
          <dl className="grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line md:grid-cols-3">
            <div className="bg-surface p-6">
              <dt className="flex items-center gap-2 text-sm text-muted"><CalendarBlank size={18} aria-hidden /> Dates</dt>
              <dd className="mt-2 font-display text-2xl font-semibold">{formatDateRange(ev.startsAt, ev.endsAt)}</dd>
            </div>
            <div className="bg-surface p-6">
              <dt className="flex items-center gap-2 text-sm text-muted"><MapPin size={18} aria-hidden /> Venue</dt>
              <dd className="mt-2 font-display text-2xl font-semibold">{ev.venueName || ev.locationLabel}</dd>
              {ev.venueAddress && <dd className="mt-1 text-ink-2">{ev.venueAddress}</dd>}
              {ev.mapUrl && (
                <dd className="mt-3">
                  <a className="link inline-flex items-center gap-1 text-sm" href={ev.mapUrl} target="_blank" rel="noopener noreferrer">
                    Open in Google Maps <ArrowUpRight size={14} aria-hidden />
                  </a>
                </dd>
              )}
            </div>
            <div className="bg-surface p-6">
              <dt className="flex items-center gap-2 text-sm text-muted"><UsersThree size={18} aria-hidden /> Entry</dt>
              <dd className="mt-2 font-display text-2xl font-semibold">Free and open to all</dd>
              <dd className="mt-1 text-ink-2">Interdenominational. Everyone is welcome.</dd>
            </div>
          </dl>
        </section>
      )}

      {days.length > 0 && (
        <section id="programme" aria-labelledby="programme-h" className="wrap py-20 md:py-28">
          <h2 id="programme-h" className="text-4xl sm:text-5xl">Programme</h2>
          {site.programmeNote && <p className="mt-4 max-w-[60ch] text-ink-2">{site.programmeNote}</p>}
          <ol className="mt-12 grid gap-4 lg:grid-cols-3">
            {days.map((d, i) => (
              <Reveal as="li" key={d.id} delay={i * 0.08} className="card flex flex-col p-7">
                <div className="flex items-baseline justify-between gap-4 border-b border-line pb-5">
                  <span className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-accent-text">{d.label}</span>
                  <time dateTime={d.day} className="text-sm text-muted">{formatDay(d.day)}</time>
                </div>
                {d.title && <h3 className="mt-5 text-2xl">{d.title}</h3>}
                <ul className="mt-4 grid gap-3">
                  {d.items.map((it) => (
                    <li key={it.id} className="flex gap-3 text-ink-2">
                      {it.time ? <span className="w-16 shrink-0 font-medium tabular-nums text-ink">{it.time}</span> : <span aria-hidden className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />}
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
        <section id="speakers" aria-labelledby="speakers-h" className="border-y border-line bg-surface py-20 md:py-28">
          <div className="wrap">
            <h2 id="speakers-h" className="text-4xl sm:text-5xl">Ministers and speakers</h2>
            <p className="mt-4 max-w-[60ch] text-lg text-ink-2">
              Ministering under the theme {ev?.theme ?? ""}{ev?.subtitle ? `, ${ev.subtitle}` : ""}.
            </p>
            {ev?.flyer && (
              <div className="mt-12 overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
                <MediaImage media={ev.flyer} sizes="(min-width: 1320px) 1240px, 100vw" className="h-auto w-full" />
              </div>
            )}
            <ul className="mt-10 grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {speakers.map((s) => (
                <li key={s.id} className="flex items-center gap-4 border-t border-line py-5">
                  {s.photo ? (
                    <span className="relative size-14 shrink-0 overflow-hidden rounded-full bg-surface-2">
                      <MediaImage media={s.photo} fill sizes="56px" className="object-cover" />
                    </span>
                  ) : (
                    <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-accent-soft font-display text-lg font-semibold text-accent-text">
                      {s.name.replace(/^(Pst|Rev|Bishop|Pro|Min|Dr|Pastor)\.?\s+/i, "").split(" ").map((w) => w[0]).slice(0, 2).join("")}
                    </span>
                  )}
                  <span>
                    <span className="block font-display text-xl font-semibold tracking-tight">{s.name}</span>
                    {s.role && <span className="text-sm text-muted">{s.role}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {expect.length > 0 && (
        <section aria-labelledby="expect-h" className="wrap grid gap-12 py-20 md:py-28 lg:grid-cols-12">
          <h2 id="expect-h" className="text-4xl sm:text-5xl lg:col-span-4">What to expect</h2>
          <ul className="grid gap-x-10 sm:grid-cols-2 lg:col-span-8">
            {expect.map((x) => (
              <li key={x.id} className="flex gap-4 border-t border-line py-5 text-lg">
                <Check size={22} className="mt-1 shrink-0 text-accent-text" aria-hidden />
                <span>{x.title}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="border-t border-line">
        <BusSection />
      </div>

      <section className="wrap pb-10">
        <p className="text-ink-2">
          Questions about attending? Call the helpline on <a className="link" href={`tel:${site.helpline.replace(/[^\d+]/g, "")}`}>{site.helpline}</a> or{" "}
          <Link className="link" href="/contact">send us a message</Link>.
        </p>
      </section>

      <PartnerBand />
    </>
  );
}
