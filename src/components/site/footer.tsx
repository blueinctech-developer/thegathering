import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/content/site-settings";
import { bareUrl, telHref } from "@/lib/format";
import { NAV, PARTNER_CTA } from "./nav";

export function SiteFooter({ site, eventName }: { site: SiteSettings; eventName?: string }) {
  const socials = [
    { href: site.youtube, label: "YouTube" },
    { href: site.facebook, label: "Facebook" },
    { href: site.instagram, label: "Instagram" },
  ].filter((s) => /^https?:\/\//.test(s.href));

  return (
    <footer className="mt-auto bg-[#140f0d] text-white">
      {/* Closing call to action */}
      <section aria-labelledby="footer-cta" className="wrap py-24 text-center md:py-32">
        <h2 id="footer-cta" className="t-display mx-auto max-w-[14ch]">
          Join us <em>at {eventName ?? site.siteName}.</em>
        </h2>
        <p className="mx-auto mt-6 max-w-[46ch] text-lg text-white/70">{site.tagline} Free to attend, open to everyone.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/gathering-2026" className="pill pill-gold pill-lg">
            Plan your visit
          </Link>
          <Link href={PARTNER_CTA.href} className="pill pill-light pill-lg">
            {PARTNER_CTA.label}
          </Link>
        </div>
      </section>

      <div className="border-t border-white/10">
        <div className="wrap grid gap-12 py-16 md:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          <div className="max-w-xs">
            <Image src="/brand/the-gathering-logo.png" alt={site.siteName} width={635} height={320} className="h-14 w-auto" />
            <p className="mt-5 text-sm text-white/60">{site.metaDescription}</p>
          </div>
          <nav aria-label="Footer">
            <p className="mb-4 text-sm font-medium text-gold">Explore</p>
            <ul className="grid gap-2.5 text-sm">
              <li><Link className="text-white/65 hover:text-white" href="/">Home</Link></li>
              {NAV.map((n) => (
                <li key={n.href}><Link className="text-white/65 hover:text-white" href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="mb-4 text-sm font-medium text-gold">Get involved</p>
            <ul className="grid gap-2.5 text-sm">
              <li><Link className="text-white/65 hover:text-white" href="/partner">Partner with us</Link></li>
              <li><Link className="text-white/65 hover:text-white" href="/partner#streams">Funding streams</Link></li>
              <li><Link className="text-white/65 hover:text-white" href="/gathering-2026#bus">Free bus</Link></li>
              {socials.map((s) => (
                <li key={s.label}>
                  <a className="text-white/65 hover:text-white" href={s.href} target="_blank" rel="noopener noreferrer">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <address className="not-italic">
            <p className="mb-4 text-sm font-medium text-gold">Contact</p>
            <ul className="grid gap-2.5 text-sm text-white/65">
              {site.contactEmail && <li><a className="hover:text-white" href={`mailto:${site.contactEmail}`}>{site.contactEmail}</a></li>}
              {site.helpline && <li><a className="hover:text-white" href={telHref(site.helpline)}>{site.helpline}</a></li>}
              {site.website && <li><a className="hover:text-white" href={site.website} target="_blank" rel="noopener noreferrer">{bareUrl(site.website)}</a></li>}
              {site.address && <li>{site.address}</li>}
            </ul>
          </address>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs text-white/50 md:flex-row md:items-center md:justify-between">
          <p>© {site.orgName}. {site.registration}.</p>
          <p className="flex items-center gap-3">
            <Image src="/brand/cofwo-logo-white.png" alt="The Chariot of Fire World Outreach" width={585} height={138} className="h-9 w-auto" />
            <span>{site.parentOrg}</span>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
