import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { getSite } from "@/lib/content/queries";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const site = await getSite();
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-accent-ink"
      >
        Skip to content
      </a>
      <SiteHeader siteName={site.siteName} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter site={site} />
    </>
  );
}
