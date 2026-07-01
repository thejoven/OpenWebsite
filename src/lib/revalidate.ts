import { revalidatePath } from "next/cache";
import { locales } from "./i18n";

export function revalidatePublicContent(slug?: string) {
  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/articles`);
    revalidatePath(`/${locale}/contact`);
    if (slug) {
      revalidatePath(`/${locale}/articles/${slug}`);
    }
  }

  revalidatePath("/sitemap.xml");
}
