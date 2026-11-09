import type { Metadata } from "next";
import { getSite } from "@/lib/content/queries";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How The Gathering handles personal information submitted through this website.",
};

export default async function PrivacyPage() {
  const site = await getSite();
  const sections: [string, string[]][] = [
    ["Who we are", [`${site.orgName} is ${site.registration.charAt(0).toLowerCase()}${site.registration.slice(1)}. ${site.parentOrg}. This policy explains how we handle personal information collected through this website.`]],
    ["What we collect", ["When you send a contact or partnership enquiry we collect the details you provide, such as your name, email address, phone number, organisation, country and message. We do not use advertising or tracking cookies."]],
    ["How we use it", ["We use your information to reply to your enquiry, to coordinate partnership and outreach activity you have asked about, and to keep you informed about The Gathering where you have shown interest. We never sell your information or share it with third parties for marketing."]],
    ["Legal basis", ["Under UK GDPR we rely on our legitimate interest in responding to enquiries and running the organisation, and on your consent where you choose to hear from us."]],
    ["How long we keep it", ["We keep enquiries only as long as needed to respond and for reasonable follow-up. You can ask us to delete your information at any time."]],
    ["Your rights", ["You have the right to access, correct or delete your personal data, and to object to or restrict how we process it. You can also complain to the Information Commissioner's Office (ico.org.uk)."]],
    ["Contact", [`For any privacy question or request, email ${site.contactEmail} or write to ${site.address}.`]],
  ];

  return (
    <article className="wrap max-w-3xl pb-24 pt-12 md:pt-16">
      <p className="eyebrow">Legal</p>
      <h1 className="mt-5 text-5xl sm:text-6xl">Privacy policy</h1>
      <div className="mt-12 grid gap-10">
        {sections.map(([h, ps]) => (
          <section key={h}>
            <h2 className="text-2xl">{h}</h2>
            <div className="prose-site mt-3 text-lg">
              {ps.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-14 border-t border-line pt-6 text-sm text-muted">
        This policy is a starting point and should be reviewed by the organisation to confirm it meets UK GDPR and the Data Protection Act 2018.
      </p>
    </article>
  );
}
