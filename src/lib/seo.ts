import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "./env";
import { defaultLocale, locales, type AppLocale } from "./i18n";

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
  const localized = Object.fromEntries(
    locales.map((locale) => [
      locale,
      absoluteUrl(`/${locale}${path === "/" ? "" : path}`)
    ])
  );

  return {
    ...localized,
    "x-default": absoluteUrl(`/${defaultLocale}${path === "/" ? "" : path}`)
  };
}

function createTitle(title?: string) {
  const value = title?.trim();
  if (!value) return siteConfig.seoTitle;

  const brand = siteConfig.name.trim();
  const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hasBrandSuffix = new RegExp(
    `(?:^|[|\\-–—:]\\s*)${escapedBrand}$`,
    "i"
  ).test(value);

  return hasBrandSuffix ? value : `${value} | ${siteConfig.name}`;
}

export function createPageMetadata(input: PageMetadataInput): Metadata {
  const path = input.path || "/";
  const title = createTitle(input.title);
  const description = input.description || siteConfig.description;
  const image = input.image
    ? absoluteUrl(input.image)
    : absoluteUrl(siteConfig.ogImage);
  const canonical = absoluteUrl(`/${input.locale}${path === "/" ? "" : path}`);

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { absolute: title },
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
