import { Bus, MapPin } from "@phosphor-icons/react/dist/ssr";
import { getList, getSite } from "@/lib/content/queries";
import { telHref } from "@/lib/format";
import { ArrowLink } from "./ui";

/** Free bus panel: striped ember panel with the numbered departure board. */
export async function BusSection({ id = "bus", detailed = false }: { id?: string; detailed?: boolean }) {
  const [site, stops] = await Promise.all([getSite(), getList("busStops")]);
  if (!stops.length) return null;

  return (
    <section id={id} aria-labelledby={`${id}-h`} className="wrap pb-24 md:pb-32">
      <div className="panel-stripes grid gap-10 rounded-[2rem] p-6 sm:p-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:p-14">
        <div>
          <span className="grid size-12 place-items-center rounded-full bg-card text-ember-deep">
            <Bus size={24} weight="light" aria-hidden />
          </span>
          <h2 id={`${id}-h`} className="t-section mt-6">{site.busHeading}</h2>
          <p className="t-lead mt-5 max-w-[46ch]">{site.busBody}</p>
          {detailed ? (
            site.busDropoff && (
              <p className="mt-8 flex max-w-[46ch] items-start gap-3 text-ink-2">
                <MapPin size={20} className="mt-0.5 shrink-0 text-ember-deep" aria-hidden />
                <span><span className="font-medium text-ink">Drop-off:</span> {site.busDropoff}</span>
              </p>
            )
          ) : (
            <div className="mt-8">
              <ArrowLink href="/gathering-2026#bus">Pick-up points and times</ArrowLink>
            </div>
          )}
        </div>
        <div className="card p-5 shadow-[0_24px_60px_-30px_rgb(23_20_15/0.4)] sm:p-7">
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <p className="font-medium">Daily departures</p>
            <p className="text-sm text-ink-3">{site.busTime}</p>
          </div>
          <ol className="mt-2">
            {stops.map((s, i) => (
              <li key={s.id} className="flex items-center gap-4 border-b border-line py-3 last:border-0">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-band text-xs tabular-nums">{i + 1}</span>
                <span className="flex-1">{s.title}</span>
                <span className="text-right text-sm text-ink-3">{s.body}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 rounded-xl bg-ember-tint px-4 py-3 text-sm">
            <span className="font-medium">{site.busFee}.</span>{" "}
            {site.helpline && (
              <>
                Helpline <a className="underline underline-offset-2" href={telHref(site.helpline)}>{site.helpline}</a>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
