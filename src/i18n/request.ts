import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/lib/i18n";

const loaders: Record<string, () => Promise<Record<string, unknown>>> = {
  zh: async () => (await import("../messages/zh.json")).default,
  en: async () => (await import("../messages/en.json")).default
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : defaultLocale;
  const load = loaders[locale] || loaders[defaultLocale] || loaders.zh;

  return {
    locale,
    messages: await load()
  };
});
