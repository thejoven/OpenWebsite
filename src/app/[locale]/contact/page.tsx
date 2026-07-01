import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/site/contact-form";
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
  const t = await getTranslations({ locale, namespace: "Contact" });
  return createPageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("subtitle")
  });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Contact" });

  return (
    <main className="bg-white py-16">
      <div className="container grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="text-sm font-black uppercase tracking-wide text-[#0e4fa0]">Contact</p>
          <h1 className="mt-4 text-4xl font-black md:text-6xl">{t("title")}</h1>
          <p className="mt-5 text-lg leading-8 text-[#5a6a7f]">{t("subtitle")}</p>
          <div className="mt-8 grid gap-3 text-sm font-bold text-[#33445a]">
            <span>admin@example.com</span>
            <span>Next.js 16 + Prisma + SQLite</span>
            <span>{locale.toUpperCase()} / SEO / Docker</span>
          </div>
        </div>
        <div className="rounded-md border border-[#d9e3ef] bg-[#f7f9fc] p-6">
          <ContactForm />
        </div>
      </div>
    </main>
  );
}
