import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getEvent, getSite } from "@/lib/content/queries";
import { formatDateRange } from "@/lib/format";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [site, ev] = await Promise.all([getSite(), getEvent()]);
  const announcement = ev
    ? { text: `${ev.name}: ${formatDateRange(ev.startsAt, ev.endsAt)}. Free entry and free buses every morning.`, href: "/gathering-2026", cta: "Plan your visit" }
    : undefined;
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
      >
        Skip to content
      </a>
      <SiteHeader siteName={site.siteName} announcement={announcement} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} eventName={ev?.name} />
    </>
  );
}
