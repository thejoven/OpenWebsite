import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/site/article-card";
import {
  getAllCategoryRoutes,
  getArticleList,
  getCategories
} from "@/lib/content";
import { localizedPath, locales, type AppLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const categories = await getAllCategoryRoutes();

  return locales.flatMap((locale) =>
    categories.map((category) => ({ locale, slug: category.slug }))
  );
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const categories = await getCategories(locale);
  const category = categories.find((item) => item.slug === slug);

  return createPageMetadata({
    locale,
    path: `/articles/category/${slug}`,
    title: category?.seoTitle || category?.name || slug,
    description: category?.seoDescription || category?.description
  });
}

export default async function ArticleCategoryPage({
  params
}: {
  params: Promise<{ locale: AppLocale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const [t, common, categories, list] = await Promise.all([
    getTranslations({ locale, namespace: "Articles" }),
    getTranslations({ locale, namespace: "Common" }),
    getCategories(locale),
    getArticleList({ locale, categorySlug: slug, page: 1, pageSize: 100 })
  ]);
  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <main className="bg-white py-16">
      <div className="container">
        <div className="max-w-3xl">
          <Link
            className="focus-ring inline-flex rounded-md text-sm font-black text-[#0e4fa0]"
            href={localizedPath(locale, "/articles")}
          >
            {t("detailBack")}
          </Link>
          <h1 className="mt-6 text-4xl font-black md:text-6xl">
            {category.name}
          </h1>
          {category.description ? (
            <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">
              {category.description}
            </p>
          ) : null}
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          <Link
            className="focus-ring rounded-md border border-[#cfdae8] bg-white px-3 py-2 text-sm font-black text-[#33445a]"
            href={localizedPath(locale, "/articles")}
          >
            {common("all")}
          </Link>
          {categories.map((item) => (
            <Link
              aria-current={item.slug === slug ? "page" : undefined}
              className={`focus-ring rounded-md border px-3 py-2 text-sm font-black ${
                item.slug === slug
                  ? "border-[#0e4fa0] bg-[#0e4fa0] text-white"
                  : "border-[#cfdae8] bg-white text-[#33445a]"
              }`}
              href={localizedPath(locale, `/articles/category/${item.slug}`)}
              key={item.id}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {list.articles.length ? (
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {list.articles.map((article) => (
              <ArticleCard article={article} key={article.id} locale={locale} />
            ))}
          </div>
        ) : (
          <p className="mt-12 rounded-md border border-[#d9e3ef] bg-[#f7f9fc] p-6 text-[#5a6a7f]">
            {common("empty")}
          </p>
        )}
      </div>
    </main>
  );
}
