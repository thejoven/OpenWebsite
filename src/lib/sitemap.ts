import type { MetadataRoute } from "next";
import { getAllCategoryRoutes, getAllPublishedArticleRoutes } from "./content";
import { prisma } from "./db";
import { revalidatePublicContent } from "./revalidate";
import { getSiteSettings, type PublicSiteSettings } from "./settings";

export const SITEMAP_REFRESH_TASK_KEY = "sitemap-refresh";

type SitemapStaticPath = {
  path: string;
  changeFrequency: NonNullable<
    MetadataRoute.Sitemap[number]["changeFrequency"]
  >;
  priority: number;
  useContentModified?: boolean;
};

type SitemapArticleRoute = {
  slug: string;
  updatedAt: Date;
};

type SitemapCategoryRoute = {
  slug: string;
  updatedAt: Date;
};

export type SitemapAutomationSummary = {
  siteUrl: string;
  sitemapUrl: string;
  entryCount: number;
  staticPageCount: number;
  categoryPageCount: number;
  articlePageCount: number;
  localeCount: number;
  locales: string[];
  lastGeneratedAt: Date;
  lastContentModifiedAt: Date | null;
};

const staticPaths: SitemapStaticPath[] = [
  {
    path: "",
    changeFrequency: "weekly",
    priority: 1,
    useContentModified: true
  },
  { path: "/services", changeFrequency: "monthly", priority: 0.8 },
  {
    path: "/articles",
    changeFrequency: "weekly",
    priority: 0.8,
    useContentModified: true
  },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.6 }
];

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function toAbsoluteUrl(siteUrl: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${trimTrailingSlash(siteUrl)}${normalizedPath}`;
}

function localizedUrl(siteUrl: string, locale: string, path = "") {
  return toAbsoluteUrl(siteUrl, `/${locale}${path}`);
}

function localizedAlternates(
  siteUrl: string,
  locales: string[],
  defaultLocale: string,
  path = ""
) {
  const localized = Object.fromEntries(
    locales.map((locale) => [locale, localizedUrl(siteUrl, locale, path)])
  );

  return {
    ...localized,
    "x-default": localizedUrl(siteUrl, defaultLocale, path)
  };
}

function latestDate(dates: Array<Date | null | undefined>) {
  const timestamps = dates
    .filter((date): date is Date => Boolean(date))
    .map((date) => date.getTime());

  return timestamps.length ? new Date(Math.max(...timestamps)) : null;
}

function getSitemapLocales(settings: PublicSiteSettings) {
  return settings.supportedLocales.length
    ? settings.supportedLocales
    : [settings.defaultLocale];
}

function buildEntries({
  articles,
  categories,
  lastContentModifiedAt,
  settings
}: {
  articles: SitemapArticleRoute[];
  categories: SitemapCategoryRoute[];
  lastContentModifiedAt: Date | null;
  settings: PublicSiteSettings;
}): MetadataRoute.Sitemap {
  const locales = getSitemapLocales(settings);

  const staticEntries = locales.flatMap((locale) =>
    staticPaths.map((item) => ({
      url: localizedUrl(settings.siteUrl, locale, item.path),
      lastModified: item.useContentModified
        ? lastContentModifiedAt || undefined
        : undefined,
      changeFrequency: item.changeFrequency,
      priority: item.priority,
      alternates: {
        languages: localizedAlternates(
          settings.siteUrl,
          locales,
          settings.defaultLocale,
          item.path
        )
      }
    }))
  );

  const categoryEntries = locales.flatMap((locale) =>
    categories.map((category) => ({
      url: localizedUrl(
        settings.siteUrl,
        locale,
        `/articles/category/${category.slug}`
      ),
      lastModified: category.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
      alternates: {
        languages: localizedAlternates(
          settings.siteUrl,
          locales,
          settings.defaultLocale,
          `/articles/category/${category.slug}`
        )
      }
    }))
  );

  const articleEntries = locales.flatMap((locale) =>
    articles.map((article) => ({
      url: localizedUrl(settings.siteUrl, locale, `/articles/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
      alternates: {
        languages: localizedAlternates(
          settings.siteUrl,
          locales,
          settings.defaultLocale,
          `/articles/${article.slug}`
        )
      }
    }))
  );

  return [...staticEntries, ...categoryEntries, ...articleEntries];
}

export async function getSitemapAutomationData() {
  const [settings, articles, categories] = await Promise.all([
    getSiteSettings(),
    getAllPublishedArticleRoutes(),
    getAllCategoryRoutes()
  ]);
  const lastContentModifiedAt = latestDate([
    ...articles.map((article) => article.updatedAt),
    ...categories.map((category) => category.updatedAt)
  ]);
  const entries = buildEntries({
    articles,
    categories,
    lastContentModifiedAt,
    settings
  });
  const locales = getSitemapLocales(settings);

  return {
    articles,
    categories,
    entries,
    settings,
    summary: {
      siteUrl: trimTrailingSlash(settings.siteUrl),
      sitemapUrl: toAbsoluteUrl(settings.siteUrl, "/sitemap.xml"),
      entryCount: entries.length,
      staticPageCount: staticPaths.length * locales.length,
      categoryPageCount: categories.length * locales.length,
      articlePageCount: articles.length * locales.length,
      localeCount: locales.length,
      locales,
      lastGeneratedAt: new Date(),
      lastContentModifiedAt
    } satisfies SitemapAutomationSummary
  };
}

export async function buildSitemapEntries() {
  const data = await getSitemapAutomationData();
  return data.entries;
}

export async function getSitemapAutomationSummary() {
  const data = await getSitemapAutomationData();
  return data.summary;
}

export async function refreshSitemapAutomation() {
  const { summary } = await getSitemapAutomationData();
  const now = new Date();
  const nextRunAt = new Date(now.getTime() + 60 * 60 * 1000);
  const lastResult = [
    `已刷新 ${summary.entryCount} 个 URL`,
    `${summary.localeCount} 个语言`,
    `${summary.categoryPageCount} 个分类 URL`,
    `${summary.articlePageCount} 个文章 URL`,
    summary.sitemapUrl
  ].join(" · ");

  revalidatePublicContent();

  await prisma.scheduledTask.upsert({
    where: { taskKey: SITEMAP_REFRESH_TASK_KEY },
    update: {
      lastRunAt: now,
      nextRunAt,
      lastResult
    },
    create: {
      taskKey: SITEMAP_REFRESH_TASK_KEY,
      name: "站点地图刷新",
      schedule: "每小时",
      status: "ACTIVE",
      description:
        "触发公开内容页面重新验证，确保 sitemap 和文章列表及时更新。",
      lastRunAt: now,
      nextRunAt,
      lastResult
    }
  });

  return summary;
}

export async function getSitemapUrl() {
  const settings = await getSiteSettings();
  return toAbsoluteUrl(settings.siteUrl, "/sitemap.xml");
}
