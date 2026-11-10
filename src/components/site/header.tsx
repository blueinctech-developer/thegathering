import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { NAV, PARTNER_CTA } from "./nav";
import { NavLinks } from "./nav-links";
import { MobileMenu } from "./mobile-menu";

export function SiteHeader({ siteName, announcement }: { siteName: string; announcement?: { text: string; href: string; cta: string } }) {
  return (
    <>
      {announcement && (
        <div className="panel-stripes text-ink">
          <Link href={announcement.href} className="wrap flex min-h-10 items-center justify-center gap-2 py-2 text-center text-sm">
            <span>{announcement.text}</span>
            <span className="hidden items-center gap-1 font-medium underline underline-offset-4 sm:inline-flex">
              {announcement.cta} <ArrowRight size={14} aria-hidden />
            </span>
          </Link>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-line bg-white dark:bg-canvas">
        <div className="wrap flex h-20 items-center justify-between gap-6">
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${siteName}, home`}>
            <Image src="/brand/the-gathering-logo.png" alt={siteName} width={635} height={320} priority className="h-14 w-auto invert dark:invert-0" />
          </Link>
          <nav aria-label="Main" className="hidden lg:block">
            <NavLinks items={NAV} />
          </nav>
          <div className="flex items-center gap-2">
            <Link href={PARTNER_CTA.href} className="pill pill-ember hidden sm:inline-flex">
              {PARTNER_CTA.label}
            </Link>
            <MobileMenu items={NAV} cta={PARTNER_CTA} />
          </div>
        </div>
      </header>
    </>
  );
}
