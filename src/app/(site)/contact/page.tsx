import type { Metadata } from "next";
import { EnvelopeSimple, Globe, MapPin, Phone, WhatsappLogo, YoutubeLogo } from "@phosphor-icons/react/dist/ssr";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHero } from "@/components/site/ui";
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
      <PageHero label="Contact" title="We would love to hear from you" intro="Get in touch about partnership, prayer, transport to the conference, or anything else." />

      <section className="bg-band py-24 md:py-32">
        <div className="wrap mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_1.6fr]">
          <ul className="grid content-start gap-3">
            {lines.map(({ Icon, label, value, href, external }) => {
              const body = (
                <>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ember-tint text-ember-deep">
                    <Icon size={20} weight="light" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-ink-3">{label}</span>
                    <span className="break-words">{value}</span>
                  </span>
                </>
              );
              return (
                <li key={label}>
                  {href ? (
                    <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="card flex items-center gap-4 p-4 transition-transform hover:-translate-y-0.5">
                      {body}
                    </a>
                  ) : (
                    <div className="card flex items-center gap-4 p-4">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <div className="card p-6 sm:p-10">
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
        </div>
      </section>
    </>
  );
}
