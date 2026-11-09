import Image from "next/image";
import Link from "next/link";
import { NAV, PARTNER_CTA } from "./nav";
import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader({ siteName }: { siteName: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl supports-[backdrop-filter]:bg-bg/70">
      <div className="wrap flex h-[4.25rem] items-center justify-between gap-6">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${siteName}, home`}>
          <Image
            src="/brand/the-gathering-logo.png"
            alt={siteName}
            width={635}
            height={320}
            priority
            className="h-12 w-auto invert dark:invert-0"
          />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={NAV} />
        </nav>
        <div className="flex items-center gap-2">
          <Link href={PARTNER_CTA.href} className="btn btn-primary hidden sm:inline-flex">
            {PARTNER_CTA.label}
          </Link>
          <MobileMenu items={NAV} cta={PARTNER_CTA} />
        </div>
      </div>
    </header>
  );
}
