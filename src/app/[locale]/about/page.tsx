import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createPageMetadata } from "@/lib/seo";
import type { AppLocale } from "@/lib/i18n";

export const revalidate = 3600;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });
  return createPageMetadata({ locale, path: "/about", title: t("title"), description: t("subtitle") });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "About" });

  return (
    <main className="bg-white">
      <section className="container grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#0e4fa0]">OpenWebsite</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">{t("subtitle")}</p>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-[#dfe8f3]">
          <Image
            alt="Industrial company website content operations"
            className="object-cover"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            src="/images/about-content-system.png"
          />
        </div>
      </section>
      <section className="border-y border-[#d9e3ef] bg-[#f7f9fc] py-16">
        <div className="container grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black">{t("missionTitle")}</h2>
            <p className="mt-4 leading-8 text-[#5a6a7f]">{t("missionBody")}</p>
          </div>
          <p className="leading-8 text-[#33445a]">{t("body")}</p>
        </div>
      </section>
    </main>
  );
}
