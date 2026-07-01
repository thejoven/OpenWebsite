import { siteSettingsSnapshot } from "@/generated/site-settings";

const configuredLocales = (
  process.env.SUPPORTED_LOCALES ||
  siteSettingsSnapshot.supportedLocales.join(",") ||
  "zh,en"
)
  .split(",")
  .map((locale) => locale.trim())
  .filter(Boolean);

export const locales =
  configuredLocales.length > 0
    ? configuredLocales
    : siteSettingsSnapshot.supportedLocales.length > 0
      ? [...siteSettingsSnapshot.supportedLocales]
      : ["zh", "en"];

const configuredDefault = process.env.DEFAULT_LOCALE || siteSettingsSnapshot.defaultLocale || "zh";

export const defaultLocale = locales.includes(configuredDefault)
  ? configuredDefault
  : locales[0] || "zh";

export type AppLocale = string;

export function isLocale(value: string | undefined): value is AppLocale {
  return Boolean(value && locales.includes(value));
}

export function normalizeLocale(value: string | undefined): AppLocale {
  return isLocale(value) ? value : defaultLocale;
}

export function localizedPath(locale: AppLocale, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}
