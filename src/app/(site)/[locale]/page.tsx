import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Activity,
  Database,
  Gauge,
  Globe2,
  Newspaper,
  RefreshCw,
  ShieldCheck
} from "lucide-react";
import { ArticleCard } from "@/components/site/article-card";
import { getRecentArticles } from "@/lib/content";
import { absoluteUrl, siteConfig } from "@/lib/env";
import { createPageMetadata } from "@/lib/seo";
import { localizedPath, type AppLocale } from "@/lib/i18n";

export const revalidate = 60;

const modules = [
  { icon: Globe2, titleZh: "多语言前台", titleEn: "Multilingual public site" },
  {
    icon: Newspaper,
    titleZh: "文章与分类",
    titleEn: "Articles and categories"
  },
  { icon: RefreshCw, titleZh: "ISR 按需更新", titleEn: "On-demand ISR" },
  { icon: Database, titleZh: "SQLite 持久化", titleEn: "SQLite persistence" },
  { icon: ShieldCheck, titleZh: "管理员后台", titleEn: "Admin console" },
  { icon: Gauge, titleZh: "SEO / CWV 优化", titleEn: "SEO / CWV ready" }
];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });
  return createPageMetadata({
    locale,
    title: t("title"),
    description: t("subtitle"),
    path: "/"
  });
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });
  const common = await getTranslations({ locale, namespace: "Common" });
  const recent = await getRecentArticles(locale, 3);
  const isEn = locale === "en";
  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": absoluteUrl("/#organization"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
        logo: absoluteUrl("/admin/ow-logo.svg")
      },
      {
        "@type": "WebSite",
        "@id": absoluteUrl("/#website"),
        name: siteConfig.name,
        url: absoluteUrl("/"),
        description: siteConfig.description,
        inLanguage: locale,
        publisher: { "@id": absoluteUrl("/#organization") }
      }
    ]
  };

  return (
    <main>
      <script
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
        id="home-jsonld"
        type="application/ld+json"
      />
      <section className="relative isolate overflow-hidden bg-[#081a30] py-20 text-white md:py-28">
        <Image
          alt="Industrial generator sets in a clean power facility"
          className="object-cover opacity-44"
          fill
          priority
          sizes="100vw"
          src="/images/hero-industrial-power.png"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,26,49,0.94),rgba(7,26,49,0.72),rgba(7,26,49,0.28))]" />
        <div className="container relative z-10 grid min-h-[560px] content-center">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-md bg-white/12 px-3 py-2 text-sm font-black uppercase tracking-wide text-[#f0bd73]">
              {t("eyebrow")}
            </p>
            <h1 className="mt-6 text-5xl font-black leading-[1.02] md:text-7xl">
              {t("title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#d8e4f2] md:text-xl">
              {t("subtitle")}
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                className="focus-ring inline-flex rounded-md bg-[#d3922d] px-5 py-3 font-black text-white hover:bg-[#b97819]"
                href={localizedPath(locale, "/contact")}
              >
                {t("primaryCta")}
              </Link>
              <Link
                className="focus-ring inline-flex rounded-md border border-white/35 px-5 py-3 font-black text-white hover:bg-white/10"
                href={localizedPath(locale, "/articles")}
              >
                {t("secondaryCta")}
              </Link>
            </div>
            <div className="mt-10 grid max-w-2xl gap-3 text-sm font-bold text-[#d8e4f2] sm:grid-cols-3">
              {[t("proofCountries"), t("proofProjects"), t("proofPower")].map(
                (item) => (
                  <div className="flex items-center gap-2" key={item}>
                    <Activity aria-hidden className="h-4 w-4 text-[#f0bd73]" />
                    {item}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black md:text-4xl">
              {t("productsTitle")}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[#5a6a7f]">
              {t("productsSubtitle")}
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  className="rounded-md border border-[#d9e3ef] bg-[#f7f9fc] p-5"
                  key={item.titleEn}
                >
                  <Icon aria-hidden className="h-7 w-7 text-[#0e4fa0]" />
                  <h3 className="mt-5 text-xl font-black">
                    {isEn ? item.titleEn : item.titleZh}
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-[#5a6a7f]">
                    {isEn
                      ? "Production-ready defaults with clear extension points."
                      : "提供可运行的默认能力，并保留清晰扩展点。"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#edf3f8] py-16">
        <div className="container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-[#ccd8e6]">
            <Image
              alt="Power engineering team reviewing industrial equipment"
              className="object-cover"
              fill
              sizes="(max-width: 1024px) 100vw, 46vw"
              src="/images/operations-dashboard.png"
            />
          </div>
          <div>
            <h2 className="text-3xl font-black md:text-4xl">{t("whyTitle")}</h2>
            <p className="mt-4 text-lg leading-8 text-[#5a6a7f]">
              {t("whySubtitle")}
            </p>
            <div className="mt-8 grid gap-3">
              {[
                isEn
                  ? "Search pages output metadata, canonical URLs and hreflang."
                  : "公开页面输出 metadata、canonical 与 hreflang。",
                isEn
                  ? "Admin changes revalidate affected public pages immediately."
                  : "后台保存内容后即时刷新受影响页面。",
                isEn
                  ? "SQLite keeps deployment small and volume-friendly."
                  : "SQLite 降低部署复杂度，并通过数据卷持久化。"
              ].map((item) => (
                <div className="flex gap-3 rounded-md bg-white p-4" key={item}>
                  <ShieldCheck
                    aria-hidden
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#177d78]"
                  />
                  <span className="font-bold text-[#243247]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">
                {t("recentTitle")}
              </h2>
            </div>
            <Link
              className="focus-ring rounded-md border border-[#cfdae8] px-4 py-2 text-sm font-black text-[#0e4fa0]"
              href={localizedPath(locale, "/articles")}
            >
              {common("viewArticles")}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {recent.map((article) => (
              <ArticleCard article={article} key={article.id} locale={locale} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
