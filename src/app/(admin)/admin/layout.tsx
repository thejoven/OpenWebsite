import type { Metadata } from "next";
import "../../globals.css";
import { siteConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    default: `Admin | ${siteConfig.name}`,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>
        <div className="min-h-screen bg-[#121212]">{children}</div>
      </body>
    </html>
  );
}
