/**
 * Load the starting content (2026 edition, speakers, programme, lists, funding streams, photos).
 * Usage: npm run db:seed            (skips if content already exists)
 *        npm run db:seed -- --force (clears content tables first; admin accounts and enquiries are kept)
 */
import "./env";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  events,
  fundingStreams,
  listItems,
  media,
  programmeDays,
  programmeItems,
  settings,
  speakers,
} from "@/lib/db/schema";
import { defaultSiteSettings } from "@/lib/content/site-settings";
import type { ListKey } from "@/lib/content/lists";
import { saveMedia } from "@/lib/media";

const UPLOADS = path.join(process.cwd(), "legacy-php", "public_html", "uploads", "2026", "11");
const ORIGINALS = path.join(process.cwd(), "assets_originals", "preview_site");

const PHOTOS: [file: string, alt: string][] = [
  ["5df99f39f813fcc3.jpg", "Worshippers raising their hands in joyful praise"],
  ["3f9086e26b26e525.jpg", "Worshippers lifting their hands in praise in a packed hall"],
  ["2a12500a87b83d48.jpg", "A full conference hall during a prayer session"],
  ["d3c26c32c77a880b.jpg", "Women worshipping with hands lifted"],
  ["53ca3de4438eef72.jpg", "Worshippers standing in prayer across the hall"],
  ["33befd5dc3b51961.jpg", "People lying in prayer before the stage during ministry"],
  ["8f33140a5944ed6f.jpg", "Congregation praying with hands outstretched"],
  ["50e973e65b8410cd.jpg", "Attendees seated and standing during worship"],
  ["13201374babf482d.jpg", "Worshippers singing during the service"],
  ["be7f40af942cf1bc.jpg", "Wide view of the congregation in prayer"],
  ["5947d39f8f8cb8de.jpg", "A minister speaking to a full hall"],
  ["85e7cc250f859de2.jpg", "Ushers and worshippers praying together in the hall"],
  ["6c79adb365394afa.jpg", "Ministers worshipping with hands raised"],
  ["bb16ff5b145acd7e.jpg", "Worshippers in prayer near the front of the hall"],
  ["dc521818577222f6.jpg", "Ministers standing in worship"],
  ["075168f17f50c3a4.jpg", "Attendees seated in the hall during the service"],
  ["4d2959514492a6d8.jpg", "A minister preaching from the pulpit"],
  ["fe11b8fc804eb4e9.jpg", "The hall filled with worshippers"],
  ["7f596fda66aded16.jpg", "Attendees bowing in prayer"],
  ["791f565563087a9b.jpg", "Crowd gathered for prayer in the main hall"],
  ["bbbdde1de07bd79c.jpg", "A worshipper praying with hands together"],
  ["7753f18ee33e3daf.jpg", "Attendees in prayer during a session"],
  ["83151f1b6392862f.jpg", "A woman worshipping with both hands raised"],
  ["1d49de5bd10e5840.jpg", "A minister praying with attendees"],
  ["68c3c4edfc3f91d4.jpg", "Attendees in quiet prayer"],
  ["bdaec318d6e49428.jpg", "Attendees listening during a session"],
  ["286392176a8d4a26.jpg", "Attendees standing in prayer"],
  ["9950c62afa114648.jpg", "A minister preaching with a microphone"],
  ["b7bfe74e48220cc6.jpg", "A minister preaching with a microphone"],
];

const LIST_SEED: Record<ListKey, { title: string; body?: string; icon?: string }[]> = {
  pillars: [
    { title: "Inspire", body: "Revival through prayer and worship.", icon: "flame" },
    { title: "Impact", body: "Compassion that transforms communities.", icon: "heart" },
    { title: "Empower", body: "Equipping lives for lasting change.", icon: "users" },
  ],
  impact: [
    { title: "5,000+", body: "Lives touched each year" },
    { title: "20,000+", body: "Individuals blessed" },
    { title: "13", body: "Medical centre partners" },
  ],
  expect: [
    { title: "An atmosphere of intercession, revival, healing and restoration" },
    { title: "Ministry from invited speakers and ministers" },
    { title: "Worship, healing and revival gatherings" },
    { title: "Medical outreach reaching up to 5,000 people" },
    { title: "Compassion feeding for vulnerable families" },
    { title: "Community engagement and outreach" },
  ],
  medical: [
    { title: "Blood pressure screening" },
    { title: "Diabetes screening" },
    { title: "Basic medical consultation" },
    { title: "Eye care support" },
    { title: "Essential medication" },
    { title: "Health education and preventive care" },
  ],
  landVision: [
    { title: "Host future Gathering conferences" },
    { title: "Provide space for outreach" },
    { title: "Support medical and compassion work" },
    { title: "Enable long-term ministry growth and training" },
  ],
  infrastructure: [
    { title: "Solar power", body: "Reliable energy for lighting, sound and outreach activities.", icon: "sun" },
    { title: "Perimeter fencing", body: "Security for the land and the equipment on it.", icon: "wall" },
    { title: "Street lighting", body: "Safety and visibility for evening programmes.", icon: "lightbulb" },
    { title: "Worship instruments and sound", body: "Permanent equipment for worship and ministry.", icon: "music" },
    { title: "Seating", body: "Conference seating for every attendee.", icon: "chair" },
    { title: "Guest accommodation", body: "A guest house for visiting ministers and volunteers.", icon: "bed" },
  ],
  busStops: [
    { title: "Elebu Junction", body: "Elebu axis" },
    { title: "Apata", body: "Wema Bank" },
    { title: "New Garage", body: "Transit hub" },
    { title: "Challenge", body: "Opposite Glo" },
    { title: "Bodija", body: "Bodija area" },
    { title: "Mobile", body: "Petrol station" },
    { title: "University of Ibadan", body: "UI gates and area" },
  ],
  partnerReasons: [
    { title: "Expand medical outreach to underserved communities" },
    { title: "Support compassion work for vulnerable families" },
    { title: "Build permanent infrastructure for future Gatherings" },
    { title: "Strengthen revival through prayer and ministry" },
  ],
  partnerTiers: [
    { title: "Prayer Partner", body: "Standing with The Gathering through prayer, intercession and spiritual support.", icon: "hands" },
    { title: "Support Partner", body: "Giving toward outreach, infrastructure and conference operations.", icon: "heart" },
    { title: "Covenant Partner", body: "A significant commitment toward the vision at a leadership giving level.", icon: "handshake" },
    { title: "Territory Builder", body: "Individuals or organisations who sponsor a specific project on The Gathering Land.", icon: "map" },
    { title: "Corporate or Ministry Sponsor", body: "Churches, organisations and businesses supporting a specific outreach or development stream.", icon: "buildings" },
  ],
  governance: [{ title: "Integrity" }, { title: "Accountability" }, { title: "Responsible stewardship" }],
};

const SPEAKERS: [string, string][] = [
  ["Pst Yomi Adeboye", "Convener"],
  ["Pst Biola Adeboye", "Co-Convener"],
  ["Rev Samson Ajetomobi", "Minister"],
  ["Bishop Henry Praise", "Minister"],
  ["Pst Odekunle Epaphras", "Minister"],
  ["Pst Biodun Oladele", "Minister"],
  ["Pst Cylas Omoloye", "Minister"],
  ["Pro Kayode Asawe", "Minister"],
  ["Min Tomiyin", "Worship Minister"],
  ["Min Mamizo", "Worship Minister"],
];

const PROGRAMME: { label: string; day: string; title: string; items: string[] }[] = [
  { label: "Day 1", day: "2026-11-27", title: "Opening worship and prayer", items: ["Opening worship and prayer", "Evening revival service"] },
  { label: "Day 2", day: "2026-11-28", title: "Teaching and outreach", items: ["Teaching and ministry sessions", "Medical outreach", "Compassion feeding"] },
  { label: "Day 3", day: "2026-11-29", title: "Healing and commissioning", items: ["Healing service", "Closing commission"] },
];

const STREAMS: [string, string, number, number, number][] = [
  ["Territory Foundation", "Completing payments and securing The Gathering Land.", 18_500_000, 11_563, 15_417],
  ["Worship and Sound", "Permanent instruments and sound for worship and ministry.", 30_000_000, 18_750, 25_000],
  ["Power and Light", "Solar installation and street lighting on site.", 25_000_000, 15_625, 20_833],
  ["Safety and Security", "Perimeter fencing and on-site security.", 15_000_000, 9_375, 12_500],
  ["Comfort and Crowd Support", "Seating, shelter and crowd care for attendees.", 12_500_000, 7_813, 10_417],
  ["Compassion and Medical Outreach", "Screening, medication and community feeding.", 10_000_000, 6_250, 8_333],
  ["Hospitality and Operations", "Guest care, volunteers and programme logistics.", 20_000_000, 12_500, 16_667],
  ["Publicity and Growth", "Reaching more communities with the invitation.", 2_000_000, 1_250, 1_667],
];

async function upload(file: string, alt: string, inGallery: boolean, sortOrder = 0) {
  const data = await readFile(file);
  const ext = path.extname(file).toLowerCase();
  const contentType = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return saveMedia({ data, filename: path.basename(file), contentType, alt, inGallery, sortOrder });
}

async function main() {
  const force = process.argv.includes("--force");
  const existing = await db.select({ id: events.id }).from(events).limit(1);
  if (existing.length && !force) {
    console.log("Content already exists. Run with --force to reset it.");
    process.exit(0);
  }
  if (force) {
    await db.execute(
      sql`TRUNCATE ${events}, ${speakers}, ${programmeItems}, ${programmeDays}, ${listItems}, ${fundingStreams}, ${settings}, ${media} RESTART IDENTITY CASCADE`,
    );
  }

  console.log("Uploading photos...");
  const photos = [];
  for (const [i, [file, alt]] of PHOTOS.entries()) {
    photos.push(await upload(path.join(UPLOADS, file), alt, true, (i + 1) * 10));
  }
  const flyer = await upload(
    path.join(ORIGINALS, "speakers-lineup.jpg"),
    "The Gathering 2026 flyer: The Move of the Spirit, 27 to 29 November, with the ministers lineup",
    false,
  );
  const busFlyer = await upload(
    path.join(ORIGINALS, "join-the-bus.jpg"),
    "Join the bus flyer: free buses to and from The Gathering, 27 to 29 November at 8 AM",
    false,
  );

  await db.insert(settings).values({ key: "site", value: defaultSiteSettings });

  await db.insert(events).values({
    name: "The Gathering 2026",
    theme: "The Move of the Spirit",
    subtitle: "Breaking Territories",
    summary: "An annual interdenominational prayer and compassion conference, reaching up to 5,000 people through medical and compassion outreach.",
    startsAt: new Date("2026-11-27T08:00:00+01:00"),
    endsAt: new Date("2026-11-29T20:00:00+01:00"),
    locationLabel: "Ibadan, Oyo State, Nigeria",
    venueName: "The Gathering International Christian Centre",
    venueAddress: "Mekun, Elebu Axis, Alao Akala Expressway, Ibadan, Oyo State, Nigeria",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Mekun%2C+Elebu%2C+Alao+Akala+Expressway%2C+Ibadan",
    heroImageId: photos[0].id,
    flyerImageId: flyer.id,
    busFlyerImageId: busFlyer.id,
    isCurrent: true,
  });

  await db.insert(speakers).values(SPEAKERS.map(([name, role], i) => ({ name, role, sortOrder: (i + 1) * 10 })));

  for (const [i, d] of PROGRAMME.entries()) {
    const [day] = await db.insert(programmeDays).values({ label: d.label, day: d.day, title: d.title, sortOrder: (i + 1) * 10 }).returning();
    await db.insert(programmeItems).values(d.items.map((title, j) => ({ dayId: day.id, title, sortOrder: (j + 1) * 10 })));
  }

  for (const [list, items] of Object.entries(LIST_SEED)) {
    await db.insert(listItems).values(
      items.map((it, i) => ({ list, title: it.title, body: it.body ?? "", icon: it.icon ?? "", sortOrder: (i + 1) * 10 })),
    );
  }

  await db.insert(fundingStreams).values(
    STREAMS.map(([title, summary, amountNgn, amountGbp, amountUsd], i) => ({
      title,
      summary,
      amountNgn,
      amountGbp,
      amountUsd,
      sortOrder: (i + 1) * 10,
    })),
  );

  const count = await db.select({ n: sql<number>`count(*)` }).from(media);
  console.log(`Seeded content and ${count[0].n} files.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
