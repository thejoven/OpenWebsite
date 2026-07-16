import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArticleListBrowser, type BrowserArticle } from "@/components/site/article-list-browser";
import { getArticleList } from "@/lib/content";
import type { AppLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Articles" });
  return createPageMetadata({
    locale,
    path: "/articles",
    title: t("title"),
    description: t("subtitle")
  });
}

export default async function ArticlesPage({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Articles" });
  const common = await getTranslations({ locale, namespace: "Common" });
  const list = await getArticleList({
    locale,
    page: 1,
    pageSize: 100
  });
  const articles: BrowserArticle[] = list.articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    summary: article.summary,
    coverImage: article.coverImage || null,
    publishedAt: article.publishedAt?.toISOString() || null,
    category: article.category
      ? {
          id: article.category.id,
          slug: article.category.slug,
          name: article.category.name
        }
      : null
  }));

  return (
    <main className="bg-white py-16">
      <div className="container">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">{t("subtitle")}</p>
        </div>

        <Suspense fallback={<div className="mt-10 h-64 rounded-md bg-[#f7f9fc]" />}>
          <ArticleListBrowser
            articles={articles}
            categories={list.categories.map((category) => ({
              id: category.id,
              slug: category.slug,
              name: category.name
            }))}
            labels={{
              all: common("all"),
              empty: common("empty"),
              readMore: common("readMore"),
              previous: common("previous"),
              next: common("next")
            }}
            locale={locale}
          />
        </Suspense>
      </div>
    </main>
  );
}
