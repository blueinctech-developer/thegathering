import { z } from "zod";

/**
 * Editable site copy and contact details. Stored as one JSON document in `settings`
 * (key "site"). Every field has a default so a fresh database still renders a full site.
 * Paragraph fields use blank lines between paragraphs.
 */
const str = (d: string) => z.string().trim().max(4000).catch(d).default(d);

export const siteSettingsSchema = z.object({
  siteName: str("The Gathering"),
  orgName: str("The Gathering International Christian Network"),
  tagline: str("Inspire. Impact. Empower."),
  metaDescription: str(
    "The Gathering is an annual interdenominational prayer and compassion conference in Ido, Oyo State, Nigeria, uniting worship, medical outreach and community care.",
  ),

  heroSummary: str("Annual interdenominational prayer and compassion conference. Reaching up to 5,000 people through medical and compassion outreach."),

  introHeading: str("A conference for revival and community transformation"),
  introBody: str("The Gathering is an annual interdenominational prayer conference committed to spiritual revival and tangible community transformation. In 2026, under the theme The Move of the Spirit, we are expanding our impact, spiritually and practically."),
  belief: str("Prayer must be accompanied by compassion. Worship must be followed by action. Faith must produce impact."),

  mission: str("To inspire revival, impart truth, and empower communities, spiritually and practically."),
  story: str("The Gathering is more than a conference. It is an annual call to prayer, revival, and transformation, bringing together ministers, families, and communities in pursuit of spiritual awakening and tangible compassion. Each year, lives are touched through worship, the Word, healing prayer, community feeding, and medical outreach."),
  whyHeading: str("Why The Gathering matters"),
  whyBody: str(
    "Across many communities in Nigeria, families face ongoing challenges. For many, opportunities for medical screening, basic medication and community support are rare.\n\nThe Gathering responds to both spiritual and practical needs, creating an atmosphere of prayer while delivering tangible outreach.",
  ),
  convenerName: str("Pastor Yomi Adeboye"),
  convenerBio: str(
    "Pastor Yomi Adeboye is the Convener of The Gathering International Christian Network and leads The Chariot of Fire World Outreach (COFWO).",
  ),
  governanceBody: str("The Gathering is committed to integrity, accountability, and responsible stewardship of all resources. Financial oversight is provided by the leadership team. Major expenditures are reviewed and approved internally. Partners receive updates and impact reports following the event. Documentation supporting key projects is maintained."),

  contactEmail: str("thegatheringcof@gmail.com"),
  helpline: str("+234 708 784 7372"),
  whatsapp: str(""),
  website: str("https://www.thecofwo.org"),
  youtube: str("https://www.youtube.com/@thegatheringcn"),
  facebook: str(""),
  instagram: str(""),
  address: str("Purley Way, Croydon, London CR0 4RG, United Kingdom"),
  registration: str("Registered in the United Kingdom, No. 15843980"),
  parentOrg: str("An arm of The Chariot of Fire World Outreach (COFWO)"),

  busHeading: str("Join the bus: free to and fro"),
  busBody: str("To make attending The Gathering seamless and accessible for everyone, complimentary buses will collect attendees each morning from designated pick-up locations across the city."),
  busFee: str("100% free, to and fro daily"),
  busTime: str("8:00 AM daily, 27 to 29 November"),
  busDropoff: str("The Gathering International Christian Network, Mekun, Elebu Axis, Alao Akala Expressway, New Garage, Ibadan"),

  medicalBody: str("As part of The Gathering 2026, a dedicated Medical Outreach Programme will provide free health screening, consultation, and basic medication distribution to support community well-being. This outreach is supported by volunteer medical professionals and partners committed to improving access to healthcare in the community."),
  medicalTarget: str("Up to 5,000 people"),
  compassionBody: str("Food distribution and practical support for vulnerable families. The Heart of Compassion initiative ensures that the most vulnerable in the community are fed and cared for during and beyond the conference."),
  communityBody: str("Encouraging unity, faith, and long-term transformation. We believe lasting change comes through engaged families and connected communities walking together in faith."),

  landHeading: str("Building a foundation for future generations"),
  landBody: str("The Gathering has secured 1 acre of land within a 2.66-acre site in Ido Local Government Area, Oyo State, Nigeria. This is the first phase of land acquisition. Initial payments have been made and development has begun.\n\nThe orange tree stands are protected and the water tank stand is preserved."),
  landSecured: str("1 acre"),
  landSecuredNote: str("Secured in the first phase"),
  landTotal: str("2.66 acres"),
  landTotalNote: str("Total site, about 10,783 m²"),

  partnerHeading: str("Stand with us in The Move of the Spirit"),
  partnerIntro: str("The Gathering continues to grow in impact and reach. The scale of this work now requires the support of committed partners who share the vision."),
  fundingTotalNgn: str("₦133,000,000"),
  fundingTotalGbp: str("£83,125"),
  fundingTotalUsd: str("$110,833"),
  partnerDocsUrl: str("https://drive.google.com/drive/u/0/folders/17andQG8HPetyNSHIRYT59MVy0o8OkLdK"),
  fundingNote: str("Exchange rates are planning estimates."),
  givingNote: str("For all giving enquiries, please contact thegatheringcof@gmail.com. No bank details, payment links, or tax relief claims are published on this site."),
  programmeNote: str("The full programme is to be confirmed and updated by the ministry team."),

  videoYoutubeId: str("PnToowvbqxA"),
  videoTitle: str("This year, The Gathering takes place on The Gathering Land"),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const defaultSiteSettings: SiteSettings = siteSettingsSchema.parse({});

export function parseSiteSettings(value: unknown): SiteSettings {
  const parsed = siteSettingsSchema.safeParse(value ?? {});
  return parsed.success ? parsed.data : defaultSiteSettings;
}

/** Split a paragraph field into paragraphs. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Field groups for the admin form. */
export const siteSettingsGroups: { title: string; fields: { key: keyof SiteSettings; label: string; long?: boolean; help?: string }[] }[] = [
  {
    title: "Identity",
    fields: [
      { key: "siteName", label: "Site name" },
      { key: "orgName", label: "Organisation name" },
      { key: "tagline", label: "Tagline" },
      { key: "metaDescription", label: "Search description", long: true, help: "Shown by Google under the site name. About 150 characters." },
    ],
  },
  {
    title: "Home page",
    fields: [
      { key: "heroSummary", label: "Hero summary", long: true, help: "One sentence under the theme. Keep it under 25 words." },
      { key: "introHeading", label: "Introduction heading" },
      { key: "introBody", label: "Introduction text", long: true },
      { key: "belief", label: "Statement of belief", long: true },
      { key: "videoYoutubeId", label: "YouTube video ID", help: "The code after watch?v= in the YouTube link." },
      { key: "videoTitle", label: "Video title" },
    ],
  },
  {
    title: "About",
    fields: [
      { key: "mission", label: "Mission", long: true },
      { key: "story", label: "Our story", long: true },
      { key: "whyHeading", label: "Why it matters: heading" },
      { key: "whyBody", label: "Why it matters: text", long: true },
      { key: "convenerName", label: "Convener name" },
      { key: "convenerBio", label: "Convener biography", long: true },
      { key: "governanceBody", label: "Governance and transparency", long: true },
    ],
  },
  {
    title: "Ministries and outreach",
    fields: [
      { key: "medicalBody", label: "Medical outreach", long: true },
      { key: "medicalTarget", label: "Medical outreach target" },
      { key: "compassionBody", label: "Heart of Compassion", long: true },
      { key: "communityBody", label: "Family and community", long: true },
    ],
  },
  {
    title: "Free bus",
    fields: [
      { key: "busHeading", label: "Heading" },
      { key: "busBody", label: "Text", long: true },
      { key: "busFee", label: "Fee" },
      { key: "busTime", label: "Departure time" },
      { key: "busDropoff", label: "Drop-off address", long: true },
    ],
  },
  {
    title: "The Gathering Land",
    fields: [
      { key: "landHeading", label: "Heading" },
      { key: "landBody", label: "Text", long: true },
      { key: "landSecured", label: "Land secured" },
      { key: "landSecuredNote", label: "Land secured: note" },
      { key: "landTotal", label: "Total site" },
      { key: "landTotalNote", label: "Total site: note" },
    ],
  },
  {
    title: "Partnership",
    fields: [
      { key: "partnerHeading", label: "Heading" },
      { key: "partnerIntro", label: "Introduction", long: true },
      { key: "fundingTotalNgn", label: "Total funding (NGN)", help: "Leave blank to add up the streams automatically." },
      { key: "fundingTotalGbp", label: "Total funding (GBP)" },
      { key: "fundingTotalUsd", label: "Total funding (USD)" },
      { key: "partnerDocsUrl", label: "Partnership documents link", help: "Where the download buttons go when no PDF is uploaded for a stream (e.g. a Google Drive folder)." },
      { key: "fundingNote", label: "Funding note" },
      { key: "givingNote", label: "Giving note", long: true },
      { key: "programmeNote", label: "Programme note", long: true },
    ],
  },
  {
    title: "Contact and legal",
    fields: [
      { key: "contactEmail", label: "Email" },
      { key: "helpline", label: "Event and transport helpline" },
      { key: "whatsapp", label: "WhatsApp number", help: "Optional. International format, e.g. +234 708 784 7372." },
      { key: "website", label: "Ministry website" },
      { key: "youtube", label: "YouTube channel link" },
      { key: "facebook", label: "Facebook link" },
      { key: "instagram", label: "Instagram link" },
      { key: "address", label: "Postal address", long: true },
      { key: "registration", label: "Registration line" },
      { key: "parentOrg", label: "Parent ministry line" },
    ],
  },
];
