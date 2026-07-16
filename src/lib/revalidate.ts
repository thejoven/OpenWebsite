import { revalidatePath } from "next/cache";
import { locales } from "./i18n";

function normalizeSlugs(value?: string | Array<string | null | undefined>) {
  if (!value) return [];
  const values = Array.isArray(value) ? value : [value];
  return [...new Set(values.filter((slug): slug is string => Boolean(slug)))];
}

export function revalidatePublicContent(
  articleSlug?: string | Array<string | null | undefined>,
  categorySlug?: string | Array<string | null | undefined>
) {
  const articleSlugs = normalizeSlugs(articleSlug);
  const categorySlugs = normalizeSlugs(categorySlug);

  for (const locale of locales) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/about`);
    revalidatePath(`/${locale}/services`);
    revalidatePath(`/${locale}/articles`);
    revalidatePath(`/${locale}/contact`);

    for (const slug of articleSlugs) {
      revalidatePath(`/${locale}/articles/${slug}`);
    }

    for (const slug of categorySlugs) {
      revalidatePath(`/${locale}/articles/category/${slug}`);
    }
  }

  if (!categorySlugs.length) {
    revalidatePath("/[locale]/articles/category/[slug]", "page");
  }

  revalidatePath("/sitemap.xml");
  revalidatePath("/robots.txt");
}
