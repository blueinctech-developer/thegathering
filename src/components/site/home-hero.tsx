import Link from "next/link";
import { CalendarCheck, Info } from "@phosphor-icons/react/dist/ssr";
import { MediaImage } from "@/components/media-image";
import type { CurrentEvent, MediaRef } from "@/lib/content/queries";
import type { SiteSettings } from "@/lib/content/site-settings";
import { formatDateRange } from "@/lib/format";
import { Accent } from "./accent";
import { Countdown } from "./countdown";

/**
 * "Coming soon" blockbuster hero, in the style of a streaming premiere: the programme flyer as full-bleed
 * key art, a fade only in the bottom-left corner (the speakers' faces and names stay clear), a big title,
 * a metadata line, synopsis, primary and "more info" actions, the speakers as a cast line, and a countdown.
 */
export function HomeHero({
  ev,
  site,
  art,
  speakers,
}: {
  ev: CurrentEvent | null;
  site: SiteSettings;
  art: MediaRef | null;
  speakers: { name: string }[];
}) {
  const days = ev ? Math.max(1, Math.round((ev.endsAt.getTime() - ev.startsAt.getTime()) / 86_400_000)) : 0;
  const cast = speakers.slice(0, 4).map((s) => s.name);
  const meta = ev
    ? [formatDateRange(ev.startsAt, ev.endsAt), `${days} days`, ev.locationLabel.replace(/, Nigeria$/, ""), "Free entry"].filter(Boolean)
    : [];

  return (
    <div className="relative isolate overflow-hidden bg-[#0b0706] text-white">
      {/* Key art: full-bleed on tablets and up; on phones it sits on top at its natural shape */}
      {art && (
        <div className="relative aspect-[2/1] w-full sm:absolute sm:inset-x-0 sm:top-0 sm:-z-10">
          <MediaImage media={art} fill priority sizes="100vw" alt="" className="object-cover" />
          {/* Phones: fade into the details below */}
          <span aria-hidden className="absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,#0b0706_100%)] sm:hidden" />
          {/* Larger screens: darken only the lower band and the bottom-left corner, where the text sits */}
          <span
            aria-hidden
            className="absolute inset-0 hidden sm:block bg-[linear-gradient(180deg,transparent_0%,transparent_57%,rgb(11_7_6/0.86)_67%,rgb(11_7_6/0.97)_80%,#0b0706_100%),linear-gradient(90deg,rgb(11_7_6/0.55)_0%,transparent_45%)] [mask-image:linear-gradient(180deg,transparent_50%,#000_60%)]"
          />
        </div>
      )}

      <div className="wrap relative flex flex-col pb-10 pt-6 sm:pb-12 sm:pt-[29vw]">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <h1 className="text-[clamp(2.75rem,5.2vw,5.5rem)] leading-[0.92] tracking-[-0.045em] [text-shadow:0_4px_32px_rgb(0_0_0/0.55)] lg:whitespace-nowrap">
              {ev ? <Accent text={ev.theme} period /> : site.siteName}
            </h1>
            {meta.length > 0 && (
              <ul className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/85" aria-label="Event details">
                <li>
                  <span className="rounded-md bg-ember px-2.5 py-1 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-white">Coming soon</span>
                </li>
                {meta.map((m, i) => (
                  <li key={m} className="flex items-center gap-3">
                    <span aria-hidden className="size-1 rounded-full bg-white/50" />
                    <span className={i === 0 ? "font-semibold text-gold" : i === meta.length - 1 ? "rounded border border-white/40 px-1.5 py-px text-xs font-semibold uppercase tracking-wide" : ""}>{m}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 max-w-[60ch] text-base text-white/85 [text-shadow:0_2px_16px_rgb(0_0_0/0.6)]">{site.heroSummary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/gathering-2026"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-white px-6 text-base font-bold text-[#0b0706] transition-transform hover:scale-[1.03] active:scale-[0.98]"
              >
                <CalendarCheck size={22} weight="fill" aria-hidden /> Plan your visit
              </Link>
              <Link
                href="/gathering-2026#programme"
                className="inline-flex min-h-12 items-center gap-2.5 rounded-lg bg-white/20 px-6 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                <Info size={22} weight="bold" aria-hidden /> More info
              </Link>
            </div>
            {cast.length > 0 && (
              <p className="mt-6 text-sm text-white/70">
                <span className="text-white/50">Ministering: </span>
                {cast.join(", ")}
                {speakers.length > cast.length && (
                  <>
                    ,{" "}
                    <Link href="/gathering-2026#speakers" className="underline underline-offset-2 hover:text-white">
                      and more
                    </Link>
                  </>
                )}
              </p>
            )}
          </div>

          {ev && (
            <div className="flex flex-col gap-3 border-l-[3px] border-gold bg-black/35 py-3 pl-4 pr-3 backdrop-blur-sm lg:mb-1">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/70">Starts in</p>
              <Countdown startsAt={ev.startsAt.toISOString()} endsAt={ev.endsAt.toISOString()} tone="dark" />
              {art && (
                <a href={`/media/${art.key}`} target="_blank" rel="noopener" className="text-xs text-white/60 underline underline-offset-2 hover:text-white">
                  View the full programme flyer
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
