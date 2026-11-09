/** The editable short lists used across the site, and how the admin should present them. */
export type ListKey =
  | "pillars"
  | "impact"
  | "expect"
  | "medical"
  | "landVision"
  | "infrastructure"
  | "busStops"
  | "partnerReasons"
  | "partnerTiers"
  | "governance"
  | "faqs";

export type ListDef = {
  key: ListKey;
  label: string;
  where: string;
  titleLabel: string;
  bodyLabel?: string;
  icon?: boolean;
};

export const LISTS: ListDef[] = [
  { key: "pillars", label: "Pillars", where: "Home page, under the hero", titleLabel: "Word", bodyLabel: "Line", icon: true },
  { key: "impact", label: "Impact figures", where: "Home and About", titleLabel: "Figure (e.g. 5,000+)", bodyLabel: "What it counts" },
  { key: "expect", label: "What to expect", where: "The Gathering 2026 page", titleLabel: "Item" },
  { key: "medical", label: "Medical services", where: "Ministries & Outreach", titleLabel: "Service" },
  { key: "landVision", label: "Vision for the land", where: "The Gathering Land", titleLabel: "Purpose" },
  { key: "infrastructure", label: "Infrastructure plans", where: "The Gathering Land", titleLabel: "Project", bodyLabel: "Description", icon: true },
  { key: "busStops", label: "Bus pick-up points", where: "Home and The Gathering 2026", titleLabel: "Stop", bodyLabel: "Landmark" },
  { key: "partnerReasons", label: "What partnership makes possible", where: "Partner With Us", titleLabel: "Outcome" },
  { key: "partnerTiers", label: "Ways to partner", where: "Partner With Us", titleLabel: "Name", bodyLabel: "Description", icon: true },
  { key: "governance", label: "Governance principles", where: "About", titleLabel: "Principle" },
  { key: "faqs", label: "Questions and answers", where: "Home and The Gathering 2026", titleLabel: "Question", bodyLabel: "Answer" },
];

export function listDef(key: string): ListDef | undefined {
  return LISTS.find((l) => l.key === key);
}

/** Icon names an editor can choose for list items (mapped to Phosphor icons in components/icon.tsx). */
export const ICON_CHOICES = [
  "flame",
  "heart",
  "users",
  "stethoscope",
  "bowl",
  "plant",
  "sun",
  "wall",
  "lightbulb",
  "music",
  "chair",
  "bed",
  "shield",
  "bank",
  "buildings",
  "handshake",
  "hands",
  "globe",
  "megaphone",
  "map",
] as const;
export type IconName = (typeof ICON_CHOICES)[number];
