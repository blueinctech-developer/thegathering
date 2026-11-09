import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { getSite } from "@/lib/content/queries";

/** Closing call to partner, used at the end of most pages. */
export async function PartnerBand() {
  const site = await getSite();
  return (
    <section aria-labelledby="partner-band-h" className="wrap pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[calc(var(--radius-card)*1.5)] border border-line bg-surface px-6 py-14 sm:px-12 md:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 size-[28rem] rounded-full opacity-60 blur-3xl"
          style={{ background: "radial-gradient(closest-side, var(--accent-soft), transparent)" }}
        />
        <div className="relative grid gap-8 md:grid-cols-[1.4fr_auto] md:items-end">
          <div>
            <h2 id="partner-band-h" className="max-w-[16ch] text-4xl sm:text-5xl lg:text-6xl">
              {site.partnerHeading}
            </h2>
            <p className="mt-5 max-w-[52ch] text-lg text-ink-2">{site.partnerIntro}</p>
          </div>
          <Link href="/partner" className="btn btn-primary self-start md:self-end">
            Partner with us <ArrowRight size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
