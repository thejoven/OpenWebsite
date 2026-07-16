import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getAllPublishedArticleRoutes, getArticleBySlug } from "@/lib/content";
import { absoluteUrl } from "@/lib/env";
import { localizedPath, locales, type AppLocale } from "@/lib/i18n";
import { createPageMetadata } from "@/lib/seo";

export const revalidate = 60;

export async function generateStaticParams() {
  const articles = await getAllPublishedArticleRoutes();
  return locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getArticleBySlug(locale, slug);
  return createPageMetadata({
    locale,
    path: `/articles/${slug}`,
    title: article?.seoTitle || article?.title,
    description: article?.seoDescription || article?.summary,
    keywords: article?.seoKeywords || undefined,
    image: article?.coverImage || undefined,
    type: "article"
  });
}

export default async function ArticleDetailPage({
  params
}: {
  params: Promise<{ locale: AppLocale; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getArticleBySlug(locale, slug);
  const t = await getTranslations({ locale, namespace: "Articles" });
  const common = await getTranslations({ locale, namespace: "Common" });

  if (!article) {
    notFound();
  }

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.summary,
    image: article.coverImage ? absoluteUrl(article.coverImage) : undefined,
    datePublished: article.publishedAt?.toISOString(),
    dateModified: article.updatedAt.toISOString(),
    mainEntityOfPage: absoluteUrl(`/${locale}/articles/${article.slug}`)
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl(`/${locale}`)
      },
      {
        "@type": "ListItem",
        position: 2,
        name: t("title"),
        item: absoluteUrl(`/${locale}/articles`)
      },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: absoluteUrl(`/${locale}/articles/${article.slug}`)
      }
    ]
  };

  return (
    <main className="bg-white">
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        type="application/ld+json"
      />
      <article>
        <header className="container py-12">
          <Link
            className="focus-ring inline-flex rounded-md text-sm font-black text-[#0e4fa0]"
            href={localizedPath(locale, "/articles")}
          >
            {t("detailBack")}
          </Link>
          <div className="mt-8 max-w-4xl">
            <p className="text-sm font-black uppercase text-[#5a6a7f]">
              {article.category?.name || common("category")}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{article.title}</h1>
            <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">{article.summary}</p>
            {article.publishedAt ? (
              <p className="mt-5 text-sm font-bold text-[#5a6a7f]">
                {common("publishedAt")} {new Intl.DateTimeFormat(locale).format(article.publishedAt)}
              </p>
            ) : null}
          </div>
        </header>
        <div className="relative h-[42vh] min-h-80 bg-[#dfe8f3]">
          <Image
            alt={article.title}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={article.coverImage || "/images/article-generator-room.png"}
          />
        </div>
        <div className="container py-12">
          <div className="prose max-w-3xl">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        </div>
      </article>
    </main>
  );
}
