import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { localizedPath, type AppLocale } from "@/lib/i18n";
import { siteConfig } from "@/lib/env";

export async function SiteFooter({ locale }: { locale: AppLocale }) {
  setRequestLocale(locale);
  const nav = await getTranslations({ locale, namespace: "Nav" });

  return (
    <footer className="bg-[#071a31] py-12 text-[#9fb2ca]">
      <div className="container">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-[#0e4fa0] text-sm font-black text-white">
                OW
              </span>
              <span className="font-black uppercase tracking-wide text-white">{siteConfig.name}</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-6">{siteConfig.description}</p>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-white">{nav("services")}</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <Link href={localizedPath(locale, "/services")}>SEO / ISR</Link>
              <Link href={localizedPath(locale, "/articles")}>Content management</Link>
              <Link href={localizedPath(locale, "/contact")}>Lead intake</Link>
            </div>
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wide text-white">{nav("contact")}</h2>
            <div className="mt-4 grid gap-2 text-sm">
              <span>admin@example.com</span>
              <span>Docker + SQLite</span>
              <span>Next.js 16</span>
            </div>
          </div>
        </div>
        <p className="pt-6 text-xs text-[#6f839d]">
          © 2026 {siteConfig.name}. Open-source company website system.
        </p>
      </div>
    </footer>
  );
}
