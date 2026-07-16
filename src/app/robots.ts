import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/settings";
import { getSitemapUrl } from "@/lib/sitemap";

export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const [settings, sitemapUrl] = await Promise.all([
    getSiteSettings(),
    getSitemapUrl()
  ]);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api"]
    },
    sitemap: sitemapUrl,
    host: settings.siteUrl
  };
}
