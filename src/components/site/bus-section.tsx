import { Bus, Clock, MapPin, Phone, Ticket } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import { getEvent, getList, getSite } from "@/lib/content/queries";
import { telHref } from "@/lib/format";
import { Reveal } from "./reveal";

/** Free bus details: flyer on one side, facts and the numbered pick-up route on the other. */
export async function BusSection({ id = "bus" }: { id?: string }) {
  const [site, ev, stops] = await Promise.all([getSite(), getEvent(), getList("busStops")]);
  if (!stops.length) return null;

  return (
    <section id={id} aria-labelledby={`${id}-h`} className="wrap py-20 md:py-28">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        {ev?.busFlyer && (
          <Reveal className="lg:col-span-5">
            <div className="overflow-hidden rounded-[var(--radius-card)] bg-surface-2">
              <MediaImage media={ev.busFlyer} sizes="(min-width: 1024px) 38vw, 100vw" className="h-auto w-full" />
            </div>
          </Reveal>
        )}
        <div className={ev?.busFlyer ? "lg:col-span-7" : "lg:col-span-12"}>
          <div className="flex items-center gap-3 text-accent-text">
            <Bus size={28} weight="light" aria-hidden />
          </div>
          <h2 id={`${id}-h`} className="mt-4 text-4xl sm:text-5xl">{site.busHeading}</h2>
          <p className="mt-5 max-w-[56ch] text-lg text-ink-2">{site.busBody}</p>

          <dl className="mt-10 grid gap-px overflow-hidden rounded-[var(--radius-card)] border border-line bg-line sm:grid-cols-3">
            {[
              { Icon: Ticket, label: "Fare", value: site.busFee },
              { Icon: Clock, label: "Departs", value: site.busTime },
              { Icon: Phone, label: "Helpline", value: site.helpline, href: site.helpline ? telHref(site.helpline) : undefined },
            ].map(({ Icon, label, value, href }) => (
              <div key={label} className="bg-surface p-5">
                <dt className="flex items-center gap-2 text-sm text-muted">
                  <Icon size={18} aria-hidden /> {label}
                </dt>
                <dd className="mt-2 font-display text-xl font-semibold">
                  {href ? <a href={href} className="hover:text-accent-text">{value}</a> : value}
                </dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-12 text-lg font-semibold">Pick-up points</h3>
          <ol className="relative mt-5 grid gap-x-8 sm:grid-cols-2">
            {stops.map((s, i) => (
              <li key={s.id} className="flex items-baseline gap-4 border-t border-line py-3.5">
                <span className="font-display text-sm font-semibold tabular-nums text-accent-text">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  <span className="font-semibold">{s.title}</span>
                  {s.body && <span className="text-muted">, {s.body}</span>}
                </span>
              </li>
            ))}
          </ol>
          {site.busDropoff && (
            <p className="mt-8 flex items-start gap-3 rounded-[var(--radius-card)] bg-accent-soft p-5 text-ink">
              <MapPin size={22} className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
              <span>
                <strong className="font-semibold">Drop-off:</strong> {site.busDropoff}
              </span>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
