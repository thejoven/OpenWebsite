import Image from "next/image";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { LocalizedArticle } from "@/lib/content";
import { localizedPath, type AppLocale } from "@/lib/i18n";

export async function ArticleCard({
  article,
  locale
}: {
  article: LocalizedArticle;
  locale: AppLocale;
}) {
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Common" });

  return (
    <article className="overflow-hidden rounded-md border border-[#d9e3ef] bg-white shadow-sm">
      <Link className="focus-ring block" href={localizedPath(locale, `/articles/${article.slug}`)}>
        <div className="relative aspect-[16/9] bg-[#dfe8f3]">
          <Image
            alt={article.title}
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            src={article.coverImage || "/images/article-generator-room.png"}
          />
        </div>
      </Link>
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#5a6a7f]">
          {article.category ? <span>{article.category.name}</span> : null}
          {article.publishedAt ? (
            <span>{new Intl.DateTimeFormat(locale).format(article.publishedAt)}</span>
          ) : null}
        </div>
        <h2 className="text-xl font-black leading-tight text-[#0d1829]">
          <Link href={localizedPath(locale, `/articles/${article.slug}`)}>{article.title}</Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5a6a7f]">{article.summary}</p>
        <Link
          className="focus-ring mt-5 inline-flex rounded-md text-sm font-black text-[#0e4fa0]"
          href={localizedPath(locale, `/articles/${article.slug}`)}
        >
          {t("readMore")}
        </Link>
      </div>
    </article>
  );
}
