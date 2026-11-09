import type { Metadata } from "next";
import { EnvelopeSimple, Globe, MapPin, Phone, WhatsappLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHeader } from "@/components/site/page-header";
import { getSite } from "@/lib/content/queries";
import { bareUrl, telHref, waHref } from "@/lib/format";
import { submitContact } from "../enquiry-actions";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact The Gathering for partnership, prayer, transport or general enquiries.",
};

export default async function ContactPage() {
  const site = await getSite();
  const lines = [
    site.contactEmail && { Icon: EnvelopeSimple, label: "Email", value: site.contactEmail, href: `mailto:${site.contactEmail}` },
    site.helpline && { Icon: Phone, label: "Event and transport helpline", value: site.helpline, href: telHref(site.helpline) },
    site.whatsapp && { Icon: WhatsappLogo, label: "WhatsApp", value: site.whatsapp, href: waHref(site.whatsapp), external: true },
    site.website && { Icon: Globe, label: "Ministry website", value: bareUrl(site.website), href: site.website, external: true },
    site.youtube && { Icon: YoutubeLogo, label: "YouTube", value: bareUrl(site.youtube).replace(/^youtube\.com\//, ""), href: site.youtube, external: true },
    site.address && { Icon: MapPin, label: "Postal address", value: site.address },
  ].filter(Boolean) as { Icon: typeof Phone; label: string; value: string; href?: string; external?: boolean }[];

  return (
    <>
      <PageHeader eyebrow="Contact" title="We would love to hear from you" intro="Get in touch about partnership, prayer, transport to the conference, or anything else." />

      <section className="wrap grid gap-12 pb-20 md:pb-28 lg:grid-cols-12">
        <ul className="grid content-start gap-px self-start overflow-hidden rounded-[var(--radius-card)] border border-line bg-line lg:col-span-4">
          {lines.map(({ Icon, label, value, href, external }) => {
            const body = (
              <>
                <Icon size={22} weight="light" className="mt-0.5 shrink-0 text-accent-text" aria-hidden />
                <span>
                  <span className="block text-sm text-muted">{label}</span>
                  <span className="font-medium break-words">{value}</span>
                </span>
              </>
            );
            return (
              <li key={label} className="bg-surface">
                {href ? (
                  <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="flex gap-4 p-5 transition-colors hover:bg-surface-2">
                    {body}
                  </a>
                ) : (
                  <div className="flex gap-4 p-5">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
        <div className="card p-6 sm:p-10 lg:col-span-7 lg:col-start-6">
          <h2 className="mb-8 text-3xl">Send a message</h2>
          <EnquiryForm
            action={submitContact}
            submitLabel="Send message"
            fields={[
              { name: "name", label: "Full name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "phone", label: "Phone", type: "tel", autoComplete: "tel" },
              { name: "subject", label: "Subject" },
              { name: "message", label: "Message", type: "textarea", required: true },
            ]}
          />
        </div>
      </section>
    </>
  );
}
