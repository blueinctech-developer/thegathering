import type { MetadataRoute } from "next";

const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/gathering-2026", "/ministries", "/land", "/partner", "/media", "/contact", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/gathering-2026" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/gathering-2026" ? 0.9 : 0.6,
  }));
}
