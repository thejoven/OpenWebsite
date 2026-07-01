import type { Metadata } from "next";
import "./globals.css";
import { siteConfig } from "@/lib/env";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`
  },
  description: siteConfig.description
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>{children}</body>
    </html>
  );
}
