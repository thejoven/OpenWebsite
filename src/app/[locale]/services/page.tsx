import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BarChart3, FileText, Languages, MailCheck, ServerCog, Shield } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/lib/i18n";

export const revalidate = 3600;

const items = [
  { icon: Languages, zh: "多语言路由与内容回退", en: "Multilingual routes and fallback content" },
  { icon: FileText, zh: "文章、分类与 Markdown 内容", en: "Articles, categories and Markdown content" },
  { icon: BarChart3, zh: "SEO metadata、站点地图与结构化数据", en: "SEO metadata, sitemap and structured data" },
  { icon: MailCheck, zh: "联系表单、校验、频率限制与邮件通知", en: "Contact form, validation, rate limits and email" },
  { icon: Shield, zh: "管理员会话与后台 CRUD", en: "Admin session and CRUD workflows" },
  { icon: ServerCog, zh: "Prisma 迁移、seed 与 Docker Compose", en: "Prisma migrations, seed and Docker Compose" }
];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Services" });
  return createPageMetadata({
    locale,
    path: "/services",
    title: t("title"),
    description: t("subtitle")
  });
}

export default async function ServicesPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Services" });
  const isEn = locale === "en";

  return (
    <main className="bg-white py-16">
      <div className="container">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">{t("subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div className="rounded-md border border-[#d9e3ef] bg-[#f7f9fc] p-6" key={item.en}>
                <Icon aria-hidden className="h-8 w-8 text-[#0e4fa0]" />
                <h2 className="mt-5 text-xl font-black">{isEn ? item.en : item.zh}</h2>
                <p className="mt-3 text-sm leading-6 text-[#5a6a7f]">
                  {isEn
                    ? "Implemented as production-oriented defaults that can be adapted per company."
                    : "以可运行的生产默认值实现，并可按企业需求继续扩展。"}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
