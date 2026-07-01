import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "./env";
import { locales, type AppLocale } from "./i18n";

type PageMetadataInput = {
  locale: AppLocale;
  path?: string;
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: "website" | "article";
};

export function localizedAlternates(path = "/") {
  return Object.fromEntries(
    locales.map((locale) => [locale, absoluteUrl(`/${locale}${path === "/" ? "" : path}`)])
  );
}

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const path = input.path || "/";
  const title = input.title
    ? `${input.title} | ${siteConfig.name}`
    : siteConfig.seoTitle;
  const description = input.description || siteConfig.description;
  const image = input.image ? absoluteUrl(input.image) : absoluteUrl(siteConfig.ogImage);
  const canonical = absoluteUrl(`/${input.locale}${path === "/" ? "" : path}`);

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title,
    description,
    keywords: input.keywords || siteConfig.keywords,
    alternates: {
      canonical,
      languages: localizedAlternates(path)
    },
    openGraph: {
      type: input.type || "website",
      title,
      description,
      locale: input.locale,
      url: canonical,
      siteName: siteConfig.name,
      images: [{ url: image, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image]
    }
  };
}
