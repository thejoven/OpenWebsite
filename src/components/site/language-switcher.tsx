"use client";

import { Languages } from "lucide-react";
import { usePathname } from "next/navigation";

export function LanguageSwitcher({
  currentLocale,
  locales
}: {
  currentLocale: string;
  locales: string[];
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const rest = segments.slice(1).join("/");

  return (
    <div className="inline-flex items-center gap-1 rounded-md border border-[#d3deeb] bg-white p-1 text-sm shadow-sm">
      <Languages aria-hidden className="ml-2 h-4 w-4 text-[#5a6a7f]" />
      {locales.map((locale) => {
        const href = `/${locale}${rest ? `/${rest}` : ""}`;
        const active = locale === currentLocale;
        return (
          <a
            aria-current={active ? "page" : undefined}
            className={`focus-ring rounded px-2.5 py-1.5 font-bold uppercase ${
              active ? "bg-[#0e4fa0] text-white" : "text-[#33445a] hover:bg-[#eef3f9]"
            }`}
            href={href}
            key={locale}
          >
            {locale}
          </a>
        );
      })}
    </div>
  );
}
