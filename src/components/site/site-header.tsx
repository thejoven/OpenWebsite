import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { Bolt, ShieldCheck } from "lucide-react";
import { localizedPath, locales, type AppLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/env";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader({ locale }: { locale: AppLocale }) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Nav" });
  const nav = [
    { href: "/", label: t("home") },
    { href: "/about", label: t("about") },
    { href: "/services", label: t("services") },
    { href: "/articles", label: t("articles") },
    { href: "/contact", label: t("contact") }
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-[#dbe4ef] bg-white/95 backdrop-blur">
      <div className="container flex min-h-[72px] items-center justify-between gap-4 py-3">
        <Link className="focus-ring flex min-w-0 items-center gap-3 rounded" href={localizedPath(locale)}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[#0e4fa0] text-sm font-black text-white">
            OW
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-black uppercase tracking-wide">
              {siteConfig.name}
            </span>
            <span className="hidden text-xs font-semibold text-[#607089] sm:block">
              SEO-first company website
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              className="focus-ring rounded-md px-3 py-2 text-sm font-bold text-[#33445a] hover:bg-[#eef3f9] hover:text-[#0e4fa0]"
              href={localizedPath(locale, item.href)}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <LanguageSwitcher currentLocale={locale} locales={locales} />
          <Link
            className="focus-ring hidden items-center gap-2 rounded-md border border-[#d3deeb] bg-white px-3 py-2 text-sm font-bold text-[#243247] hover:bg-[#eef3f9] md:inline-flex"
            href="/admin"
          >
            <ShieldCheck aria-hidden className="h-4 w-4" />
            {t("admin")}
          </Link>
          <Link
            className="focus-ring inline-flex items-center gap-2 rounded-md bg-[#d3922d] px-3.5 py-2 text-sm font-black text-white shadow-sm hover:bg-[#b97819]"
            href={localizedPath(locale, "/contact")}
          >
            <Bolt aria-hidden className="h-4 w-4" />
            {t("quote")}
          </Link>
        </div>
      </div>
      <nav className="container flex gap-1 overflow-x-auto pb-3 lg:hidden" aria-label="Mobile navigation">
        {nav.map((item) => (
          <Link
            className="focus-ring shrink-0 rounded-md bg-[#eef3f9] px-3 py-2 text-sm font-bold text-[#33445a]"
            href={localizedPath(locale, item.href)}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
