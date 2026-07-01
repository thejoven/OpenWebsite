import type { MetadataRoute } from "next";
import { getAllPublishedArticleRoutes } from "@/lib/content";
import { absoluteUrl } from "@/lib/env";
import { locales } from "@/lib/i18n";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/about", "/services", "/articles", "/contact"];
  const articles = await getAllPublishedArticleRoutes();

  const staticEntries = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: absoluteUrl(`/${locale}${path}`),
      lastModified: new Date(),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7
    }))
  );

  const articleEntries = locales.flatMap((locale) =>
    articles.map((article) => ({
      url: absoluteUrl(`/${locale}/articles/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  );

  return [...staticEntries, ...articleEntries];
}
