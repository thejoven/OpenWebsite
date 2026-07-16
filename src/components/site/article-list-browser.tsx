"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export type BrowserArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  coverImage: string | null;
  publishedAt: string | null;
  category: { id: string; slug: string; name: string } | null;
};

export type BrowserCategory = {
  id: string;
  slug: string;
  name: string;
};

export function ArticleListBrowser({
  locale,
  articles,
  categories,
  labels
}: {
  locale: string;
  articles: BrowserArticle[];
  categories: BrowserCategory[];
  labels: {
    all: string;
    empty: string;
    readMore: string;
    previous: string;
    next: string;
  };
}) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category") || "";
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = 6;
  const filtered = articles.filter(
    (article) => !category || article.category?.slug === category
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  function hrefFor(nextPage: number, nextCategory = category) {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    const query = params.toString();
    return `/${locale}/articles${query ? `?${query}` : ""}`;
  }

  return (
    <>
      <div className="mt-10 flex flex-wrap gap-2">
        <Link
          className={`focus-ring rounded-md border px-3 py-2 text-sm font-black ${
            !category
              ? "border-[#0e4fa0] bg-[#0e4fa0] text-white"
              : "border-[#cfdae8] bg-white text-[#33445a]"
          }`}
          href={`/${locale}/articles`}
        >
          {labels.all}
        </Link>
        {categories.map((item) => (
          <Link
            className={`focus-ring rounded-md border px-3 py-2 text-sm font-black ${
              category === item.slug
                ? "border-[#0e4fa0] bg-[#0e4fa0] text-white"
                : "border-[#cfdae8] bg-white text-[#33445a]"
            }`}
            href={`/${locale}/articles/category/${item.slug}`}
            key={item.id}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((article) => (
          <article
            className="overflow-hidden rounded-md border border-[#d9e3ef] bg-white shadow-sm"
            key={article.id}
          >
            <Link
              className="focus-ring block"
              href={`/${locale}/articles/${article.slug}`}
            >
              <div className="relative aspect-[16/9] bg-[#dfe8f3]">
                <Image
                  alt={article.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  src={
                    article.coverImage || "/images/article-generator-room.png"
                  }
                />
              </div>
            </Link>
            <div className="p-5">
              <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase text-[#5a6a7f]">
                {article.category ? <span>{article.category.name}</span> : null}
                {article.publishedAt ? (
                  <span>
                    {new Intl.DateTimeFormat(locale).format(
                      new Date(article.publishedAt)
                    )}
                  </span>
                ) : null}
              </div>
              <h2 className="text-xl font-black leading-tight text-[#0d1829]">
                <Link href={`/${locale}/articles/${article.slug}`}>
                  {article.title}
                </Link>
              </h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[#5a6a7f]">
                {article.summary}
              </p>
              <Link
                className="focus-ring mt-5 inline-flex rounded-md text-sm font-black text-[#0e4fa0]"
                href={`/${locale}/articles/${article.slug}`}
              >
                {labels.readMore}
              </Link>
            </div>
          </article>
        ))}
      </div>

      {visible.length === 0 ? (
        <p className="mt-12 rounded-md border border-[#d9e3ef] bg-[#f7f9fc] p-6 text-[#5a6a7f]">
          {labels.empty}
        </p>
      ) : null}

      {totalPages > 1 ? (
        <nav
          className="mt-10 flex items-center justify-between gap-3"
          aria-label="Pagination"
        >
          {safePage > 1 ? (
            <Link
              className="focus-ring rounded-md border border-[#cfdae8] bg-white px-4 py-2 text-sm font-bold"
              href={hrefFor(safePage - 1)}
            >
              {labels.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-sm font-bold text-[#5a6a7f]">
            {safePage} / {totalPages}
          </span>
          {safePage < totalPages ? (
            <Link
              className="focus-ring rounded-md border border-[#cfdae8] bg-white px-4 py-2 text-sm font-bold"
              href={hrefFor(safePage + 1)}
            >
              {labels.next}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </>
  );
}
