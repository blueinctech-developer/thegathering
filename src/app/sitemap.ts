import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";

const base = siteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/about", "/gathering-2026", "/ministries", "/land", "/partner", "/media", "/contact", "/privacy"].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: path === "" || path === "/gathering-2026" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/gathering-2026" ? 0.9 : 0.6,
  }));
}
