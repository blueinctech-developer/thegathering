import Image from "next/image";
import Link from "next/link";
import { EnvelopeSimple, Phone, YoutubeLogo, FacebookLogo, InstagramLogo, Globe, MapPin } from "@phosphor-icons/react/dist/ssr";
import type { SiteSettings } from "@/lib/content/site-settings";
import { bareUrl, telHref } from "@/lib/format";
import { NAV, PARTNER_CTA } from "./nav";

export function SiteFooter({ site }: { site: SiteSettings }) {
  const socials = [
    { href: site.youtube, label: "YouTube", Icon: YoutubeLogo },
    { href: site.facebook, label: "Facebook", Icon: FacebookLogo },
    { href: site.instagram, label: "Instagram", Icon: InstagramLogo },
  ].filter((s) => /^https?:\/\//.test(s.href));

  return (
    <footer className="mt-auto border-t border-line bg-surface-2/60">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1.2fr] md:py-20">
        <div className="max-w-sm">
          <Image src="/brand/the-gathering-logo.png" alt={site.siteName} width={635} height={320} className="h-14 w-auto invert dark:invert-0" />
          <p className="mt-5 text-ink-2">{site.tagline}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2" aria-label="Social media">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="grid size-11 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-ink hover:text-ink"
                  >
                    <Icon size={20} aria-hidden />
                    <span className="sr-only">{`${site.siteName} on ${label}`}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Footer">
          <ul className="grid grid-cols-2 gap-x-6 gap-y-3 text-[0.9375rem] md:grid-cols-1">
            <li><Link className="text-ink-2 hover:text-ink" href="/">Home</Link></li>
            {NAV.map((n) => (
              <li key={n.href}><Link className="text-ink-2 hover:text-ink" href={n.href}>{n.label}</Link></li>
            ))}
            <li><Link className="text-ink-2 hover:text-ink" href={PARTNER_CTA.href}>Partner</Link></li>
            <li><Link className="text-ink-2 hover:text-ink" href="/privacy">Privacy</Link></li>
          </ul>
        </nav>

        <address className="not-italic">
          <ul className="grid gap-4 text-[0.9375rem]">
            {site.contactEmail && (
              <li>
                <a className="flex items-start gap-3 text-ink-2 hover:text-ink" href={`mailto:${site.contactEmail}`}>
                  <EnvelopeSimple size={20} className="mt-0.5 shrink-0 text-accent-text" aria-hidden /> {site.contactEmail}
                </a>
              </li>
            )}
            {site.helpline && (
              <li>
                <a className="flex items-start gap-3 text-ink-2 hover:text-ink" href={telHref(site.helpline)}>
                  <Phone size={20} className="mt-0.5 shrink-0 text-accent-text" aria-hidden /> {site.helpline}
                </a>
              </li>
            )}
            {site.website && (
              <li>
                <a className="flex items-start gap-3 text-ink-2 hover:text-ink" href={site.website} target="_blank" rel="noopener noreferrer">
                  <Globe size={20} className="mt-0.5 shrink-0 text-accent-text" aria-hidden /> {bareUrl(site.website)}
                </a>
              </li>
            )}
            {site.address && (
              <li className="flex items-start gap-3 text-ink-2">
                <MapPin size={20} className="mt-0.5 shrink-0 text-accent-text" aria-hidden /> {site.address}
              </li>
            )}
          </ul>
        </address>
      </div>
      <div className="border-t border-line">
        <div className="wrap flex flex-col gap-4 py-6 text-sm text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {site.orgName}. {site.registration}.
          </p>
          <p className="flex items-center gap-3">
            <Image src="/brand/cofwo-logo.png" alt="" width={585} height={138} className="h-5 w-auto opacity-70 invert dark:invert-0" />
            <span>{site.parentOrg}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
