import { defaultLocale, locales } from "./i18n";
import { siteSettingsSnapshot } from "@/generated/site-settings";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || siteSettingsSnapshot.siteUrl;

export const siteConfig = {
  name: process.env.SITE_NAME || siteSettingsSnapshot.siteName,
  description:
    process.env.SITE_DESCRIPTION ||
    siteSettingsSnapshot.seoDescription,
  keywords:
    process.env.SITE_KEYWORDS || siteSettingsSnapshot.seoKeywords,
  seoTitle: process.env.SITE_SEO_TITLE || siteSettingsSnapshot.seoTitle,
  ogImage: process.env.SITE_OG_IMAGE || siteSettingsSnapshot.ogImage,
  siteUrl: trimTrailingSlash(rawSiteUrl),
  defaultLocale,
  locales
};

export function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.siteUrl}${normalized}`;
}
