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
    "The Gathering is an annual interdenominational prayer and compassion conference in Ibadan, Oyo State, Nigeria, uniting worship, medical outreach and community care.",
  ),

  heroSummary: str("Three days of prayer, worship and practical compassion in Ibadan, Oyo State. Free to attend, open to all."),

  introHeading: str("A conference for revival and community transformation"),
  introBody: str(
    "The Gathering is an annual interdenominational prayer conference committed to spiritual revival and tangible community transformation. It brings together ministers, families and communities in pursuit of spiritual awakening and practical compassion.\n\nEach year, lives are touched through worship, the Word, healing prayer, community feeding and medical outreach.",
  ),
  belief: str("Prayer must be accompanied by compassion. Worship must be followed by action. Faith must produce impact."),

  mission: str("To inspire revival, impart truth, and empower communities, spiritually and practically."),
  story: str(
    "The Gathering is more than a conference. It is an annual call to prayer, revival and transformation, bringing together ministers, families and communities in pursuit of spiritual awakening and tangible compassion.\n\nEach year, lives are touched through worship, the Word, healing prayer, community feeding and medical outreach.",
  ),
  whyHeading: str("Why The Gathering matters"),
  whyBody: str(
    "Across many communities in Nigeria, families face ongoing challenges. For many, opportunities for medical screening, basic medication and community support are rare.\n\nThe Gathering responds to both spiritual and practical needs, creating an atmosphere of prayer while delivering tangible outreach.",
  ),
  convenerName: str("Pastor Yomi Adeboye"),
  convenerBio: str(
    "Pastor Yomi Adeboye is the Convener of The Gathering International Christian Network and leads The Chariot of Fire World Outreach (COFWO).",
  ),
  governanceBody: str(
    "The Gathering is committed to integrity, accountability and responsible stewardship of every resource entrusted to it. Financial oversight is provided by the leadership team, major expenditure is reviewed and approved internally, and partners receive updates and impact reports after each conference.",
  ),

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

  busHeading: str("Free buses, to and fro"),
  busBody: str(
    "Complimentary buses collect attendees every morning from pick-up points across Ibadan and bring them home after the day's sessions.",
  ),
  busFee: str("Free, both ways"),
  busTime: str("8:00 AM daily"),
  busDropoff: str("The Gathering International Christian Network, Mekun, Elebu Axis, Alao Akala Expressway, New Garage, Ibadan"),

  medicalBody: str(
    "A dedicated medical outreach provides free health screening, consultation and basic medication, delivered by volunteer medical professionals and partners committed to better access to healthcare.",
  ),
  medicalTarget: str("Up to 5,000 people"),
  compassionBody: str(
    "The Heart of Compassion initiative provides food and practical support so the most vulnerable families are cared for during and beyond the conference.",
  ),
  communityBody: str(
    "Lasting change comes through engaged families and connected communities walking together in faith.",
  ),

  landHeading: str("Building a foundation for future generations"),
  landBody: str(
    "The Gathering has secured land in Ido Local Government Area, Oyo State. Initial payments have been made and development has begun, with the existing orange tree stands protected and the water tank stand preserved.",
  ),
  landSecured: str("1 acre"),
  landSecuredNote: str("Secured in the first phase"),
  landTotal: str("2.66 acres"),
  landTotalNote: str("Total site, about 10,783 m²"),

  partnerHeading: str("Stand with us"),
  partnerIntro: str(
    "The Gathering continues to grow in reach and impact. The scale of this work now needs committed partners who share the vision.",
  ),
  fundingNote: str("Exchange rates are planning estimates."),
  givingNote: str(
    "For all giving enquiries, contact our team by email. No bank details or payment links are published on this site.",
  ),
  programmeNote: str("The full programme will be confirmed by the ministry team closer to the conference."),

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
