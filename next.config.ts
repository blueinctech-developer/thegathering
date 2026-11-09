import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Native package stays outside the server bundle.
  serverExternalPackages: ["sharp"],
  images: {
    // Uploaded photos are served by app/media/[...key]/route.ts
    localPatterns: [{ pathname: "/media/**" }, { pathname: "/brand/**" }],
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    serverActions: { bodySizeLimit: "16mb" },
  },
  async redirects() {
    // Old site addresses, so existing links and search results keep working.
    return [
      { source: "/give", destination: "/partner", permanent: true },
      { source: "/about-us", destination: "/about", permanent: true },
      { source: "/contact-us", destination: "/contact", permanent: true },
      { source: "/outreach", destination: "/ministries", permanent: true },
      { source: "/speakers", destination: "/gathering-2026", permanent: true },
      { source: "/schedule", destination: "/gathering-2026", permanent: true },
      { source: "/venue", destination: "/gathering-2026", permanent: true },
      { source: "/register", destination: "/gathering-2026", permanent: false },
      { source: "/gallery", destination: "/media", permanent: true },
      { source: "/faqs", destination: "/gathering-2026", permanent: true },
      { source: "/privacy-policy", destination: "/privacy", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
