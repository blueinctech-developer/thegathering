import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Auth tables (Better Auth core schema, snake_case columns)           */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (t) => [index("session_user_idx").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("account_user_idx").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

/* ------------------------------------------------------------------ */
/* Site content                                                        */
/* ------------------------------------------------------------------ */

/** Uploaded files (photos, flyers, PDFs). `key` is the object key in the bucket. */
export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  bytes: integer("bytes").notNull().default(0),
  width: integer("width"),
  height: integer("height"),
  alt: text("alt").notNull().default(""),
  inGallery: boolean("in_gallery").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Free-form site copy and contact details, stored as one validated JSON document. */
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** The conference edition shown on the site (one row is marked current). */
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  theme: text("theme").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  summary: text("summary").notNull().default(""),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
  locationLabel: text("location_label").notNull().default(""),
  venueName: text("venue_name").notNull().default(""),
  venueAddress: text("venue_address").notNull().default(""),
  mapUrl: text("map_url").notNull().default(""),
  heroImageId: integer("hero_image_id").references(() => media.id, { onDelete: "set null" }),
  flyerImageId: integer("flyer_image_id").references(() => media.id, { onDelete: "set null" }),
  busFlyerImageId: integer("bus_flyer_image_id").references(() => media.id, { onDelete: "set null" }),
  overviewPdfId: integer("overview_pdf_id").references(() => media.id, { onDelete: "set null" }),
  partnerHeroImageId: integer("partner_hero_image_id").references(() => media.id, { onDelete: "set null" }),
  isCurrent: boolean("is_current").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const speakers = pgTable("speakers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  photoId: integer("photo_id").references(() => media.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

export const programmeDays = pgTable("programme_days", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  day: date("day").notNull(),
  title: text("title").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const programmeItems = pgTable(
  "programme_items",
  {
    id: serial("id").primaryKey(),
    dayId: integer("day_id")
      .notNull()
      .references(() => programmeDays.id, { onDelete: "cascade" }),
    time: text("time").notNull().default(""),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("programme_items_day_idx").on(t.dayId)],
);

/**
 * Short editable lists that appear across the site (highlights, bus stops,
 * partnership tiers, land plans...). `list` names which list an item belongs to.
 */
export const listItems = pgTable(
  "list_items",
  {
    id: serial("id").primaryKey(),
    list: text("list").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    icon: text("icon").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    published: boolean("published").notNull().default(true),
  },
  (t) => [index("list_items_list_idx").on(t.list, t.sortOrder)],
);

export const fundingStreams = pgTable("funding_streams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  amountNgn: integer("amount_ngn").notNull().default(0),
  amountGbp: integer("amount_gbp").notNull().default(0),
  amountUsd: integer("amount_usd").notNull().default(0),
  documentId: integer("document_id").references(() => media.id, { onDelete: "set null" }),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
});

/** Contact and partnership enquiries. Saved before any email is sent. */
export const enquiries = pgTable(
  "enquiries",
  {
    id: serial("id").primaryKey(),
    kind: text("kind").notNull(), // "contact" | "partnership"
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone").notNull().default(""),
    organisation: text("organisation").notNull().default(""),
    country: text("country").notNull().default(""),
    interest: text("interest").notNull().default(""),
    subject: text("subject").notNull().default(""),
    message: text("message").notNull(),
    status: text("status").notNull().default("new"), // new | read | archived
    emailStatus: text("email_status").notNull().default("pending"), // pending | sent | failed | skipped
    ipHash: text("ip_hash").notNull().default(""),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("enquiries_created_idx").on(t.createdAt), index("enquiries_ip_idx").on(t.ipHash, t.createdAt)],
);

export const authSchema = { user, session, account, verification };

export type Media = typeof media.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type Speaker = typeof speakers.$inferSelect;
export type ListItem = typeof listItems.$inferSelect;
export type FundingStream = typeof fundingStreams.$inferSelect;
export type Enquiry = typeof enquiries.$inferSelect;
