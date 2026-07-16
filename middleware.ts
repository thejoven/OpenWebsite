import createMiddleware from "next-intl/middleware";
import { defaultLocale, locales } from "./src/lib/i18n";

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  alternateLinks: false
});

export const config = {
  matcher: ["/((?!api|admin|_next|.*\\..*).*)"]
};
