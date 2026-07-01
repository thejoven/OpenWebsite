import { writeFile } from "node:fs/promises";
import path from "node:path";
import type { SiteSetting } from "@prisma/client";
import { siteSettingsSnapshot } from "@/generated/site-settings";
import { prisma } from "./db";

export const SITE_SETTINGS_ID = "default";

export type PublicSiteSettings = {
  siteName: string;
  siteUrl: string;
  defaultLocale: string;
  supportedLocales: string[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  ogImage: string;
};

export const fallbackSiteSettings: PublicSiteSettings = {
  siteName: siteSettingsSnapshot.siteName,
  siteUrl: siteSettingsSnapshot.siteUrl,
  defaultLocale: siteSettingsSnapshot.defaultLocale,
  supportedLocales: [...siteSettingsSnapshot.supportedLocales],
  seoTitle: siteSettingsSnapshot.seoTitle,
  seoDescription: siteSettingsSnapshot.seoDescription,
  seoKeywords: siteSettingsSnapshot.seoKeywords,
  ogImage: siteSettingsSnapshot.ogImage
};

export function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function normalizeLocales(input: string | string[]) {
  const raw = Array.isArray(input) ? input : input.split(/[\s,，]+/);
  const normalized = raw
    .map((locale) => locale.trim())
    .filter(Boolean)
    .map((locale) => locale.toLowerCase())
    .filter((locale) => /^[a-z]{2,3}(?:-[a-z0-9]{2,8})?$/.test(locale));

  return [...new Set(normalized)].slice(0, 12);
}

export function serializeLocales(locales: string[]) {
  return locales.join(",");
}

export function siteSettingsFromRow(row: SiteSetting | null): PublicSiteSettings {
  if (!row) {
    return fallbackSiteSettings;
  }

  const supportedLocales = normalizeLocales(row.supportedLocales);
  const defaultLocale = supportedLocales.includes(row.defaultLocale)
    ? row.defaultLocale
    : supportedLocales[0] || fallbackSiteSettings.defaultLocale;

  return {
    siteName: row.siteName || fallbackSiteSettings.siteName,
    siteUrl: trimTrailingSlash(row.siteUrl || fallbackSiteSettings.siteUrl),
    defaultLocale,
    supportedLocales: supportedLocales.length ? supportedLocales : fallbackSiteSettings.supportedLocales,
    seoTitle: row.seoTitle || fallbackSiteSettings.seoTitle,
    seoDescription: row.seoDescription || fallbackSiteSettings.seoDescription,
    seoKeywords: row.seoKeywords || fallbackSiteSettings.seoKeywords,
    ogImage: row.ogImage || fallbackSiteSettings.ogImage
  };
}

export async function getSiteSettings() {
  try {
    const row = await prisma.siteSetting.findUnique({ where: { id: SITE_SETTINGS_ID } });
    return siteSettingsFromRow(row);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falling back to generated site settings:", error);
    }
    return fallbackSiteSettings;
  }
}

export async function getSupportedLocales() {
  const settings = await getSiteSettings();
  return settings.supportedLocales;
}

export async function syncSiteSettingsSnapshot(settings: PublicSiteSettings) {
  const target = path.join(process.cwd(), "src", "generated", "site-settings.ts");
  const body = `export const siteSettingsSnapshot = ${JSON.stringify(settings, null, 2)} as const;\n`;

  await writeFile(target, body, "utf8");
}
