import type { Article, ArticleTranslation, Category, CategoryTranslation } from "@prisma/client";
import { prisma } from "./db";
import { defaultLocale, type AppLocale } from "./i18n";

export type LocalizedCategory = {
  id: string;
  slug: string;
  name: string;
  description: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  sortOrder: number;
};

export type LocalizedArticle = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoKeywords?: string | null;
  coverImage?: string | null;
  publishedAt?: Date | null;
  updatedAt: Date;
  category?: LocalizedCategory | null;
};

type ArticleWithRelations = Article & {
  translations: ArticleTranslation[];
  category:
    | (Category & {
        translations: CategoryTranslation[];
      })
    | null;
};

type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[];
};

const fallbackCategories: LocalizedCategory[] = [
  {
    id: "fallback-industrial-power",
    slug: "industrial-power",
    name: "工业电力",
    description: "柴油、燃气与混合能源解决方案。",
    sortOrder: 10
  },
  {
    id: "fallback-service",
    slug: "service-and-projects",
    name: "服务与案例",
    description: "项目交付、维保与工程支持。",
    sortOrder: 20
  }
];

const fallbackArticles: LocalizedArticle[] = [
  {
    id: "fallback-selection-guide",
    slug: "diesel-generator-selection-guide",
    title: "工业企业如何选择柴油发电机组",
    summary: "从功率、负载、冗余、噪音和运维角度，快速建立企业备用电源选型框架。",
    content:
      "## 先明确负载类型\n\n工业备用电源的核心不是简单放大功率，而是理解负载启动电流、连续运行时长和允许切换时间。\n\n## 建议\n\n提供负载清单、现场环境和并机需求，工程团队可以据此输出更准确的配置方案。",
    coverImage: "/images/article-generator-room.png",
    publishedAt: new Date("2026-01-12T08:00:00.000Z"),
    updatedAt: new Date("2026-01-12T08:00:00.000Z"),
    category: fallbackCategories[0]
  },
  {
    id: "fallback-gas-project",
    slug: "gas-power-station-project-readiness",
    title: "燃气电站项目启动前需要准备什么",
    summary: "燃气品质、并网要求、现场土建与长期运维，是连续电力项目能否稳定落地的关键。",
    content:
      "## 燃气条件决定系统边界\n\n燃气发电项目首先要确认气源稳定性、热值范围、压力、硫含量和净化条件。\n\n## 项目准备清单\n\n气源检测、并网要求、现场平面、散热噪音边界和长期服务计划都应尽早确认。",
    coverImage: "/images/article-gas-station.png",
    publishedAt: new Date("2026-02-20T08:00:00.000Z"),
    updatedAt: new Date("2026-02-20T08:00:00.000Z"),
    category: fallbackCategories[1]
  }
];

const fallbackArticlesEn: Record<string, Partial<LocalizedArticle>> = {
  "diesel-generator-selection-guide": {
    title: "How industrial teams choose diesel generator sets",
    summary: "A practical framework for sizing standby power across load, redundancy and service needs.",
    content:
      "## Start with the load profile\n\nReliable standby power is not only about oversizing capacity. Teams need to understand starting current, runtime, transfer time and redundancy requirements.\n\n## Recommendation\n\nShare the load list, altitude, ambient temperature and paralleling needs so engineering can recommend the right configuration."
  },
  "gas-power-station-project-readiness": {
    title: "What to prepare before a gas power station project",
    summary: "Gas quality, grid requirements, civil works and service planning determine project readiness.",
    content:
      "## Gas conditions define the system\n\nGas power projects start with stable supply, heating value, pressure, sulfur content and treatment conditions.\n\n## Project checklist\n\nConfirm gas reports, grid requirements, site layout, cooling, noise limits and long-term service planning."
  }
};

const fallbackCategoriesEn: Record<string, Partial<LocalizedCategory>> = {
  "industrial-power": {
    name: "Industrial Power",
    description: "Diesel, gas and hybrid power solutions."
  },
  "service-and-projects": {
    name: "Service & Projects",
    description: "Delivery, maintenance and engineering support."
  }
};

function localizeFallback(locale: AppLocale) {
  if (locale !== "en") {
    return { categories: fallbackCategories, articles: fallbackArticles };
  }

  const categories = fallbackCategories.map((category) => ({
    ...category,
    ...fallbackCategoriesEn[category.slug]
  }));

  const articles = fallbackArticles.map((article) => ({
    ...article,
    ...fallbackArticlesEn[article.slug],
    category: article.category
      ? {
          ...article.category,
          ...fallbackCategoriesEn[article.category.slug]
        }
      : article.category
  }));

  return { categories, articles };
}

function pickTranslation<T extends { locale: string }>(
  translations: T[],
  locale: AppLocale
): T | undefined {
  return (
    translations.find((translation) => translation.locale === locale) ||
    translations.find((translation) => translation.locale === defaultLocale) ||
    translations[0]
  );
}

function toLocalizedCategory(row: CategoryWithTranslations, locale: AppLocale): LocalizedCategory {
  const translation = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    sortOrder: row.sortOrder,
    name: translation?.name || row.slug,
    description: translation?.description || "",
    seoTitle: translation?.seoTitle,
    seoDescription: translation?.seoDescription,
    seoKeywords: translation?.seoKeywords
  };
}

function toLocalizedArticle(row: ArticleWithRelations, locale: AppLocale): LocalizedArticle {
  const translation = pickTranslation(row.translations, locale);
  return {
    id: row.id,
    slug: row.slug,
    title: translation?.title || row.slug,
    summary: translation?.summary || "",
    content: translation?.content || "",
    seoTitle: translation?.seoTitle,
    seoDescription: translation?.seoDescription,
    seoKeywords: translation?.seoKeywords,
    coverImage: row.coverImage,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    category: row.category ? toLocalizedCategory(row.category, locale) : null
  };
}

async function safePublic<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Falling back to static public content:", error);
    }
    return fallback;
  }
}

export async function getCategories(locale: AppLocale) {
  const fallback = localizeFallback(locale).categories;
  return safePublic(async () => {
    const categories = await prisma.category.findMany({
      include: { translations: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    });
    return categories.map((category) => toLocalizedCategory(category, locale));
  }, fallback);
}

export async function getArticleList({
  locale,
  categorySlug,
  page = 1,
  pageSize = 6
}: {
  locale: AppLocale;
  categorySlug?: string;
  page?: number;
  pageSize?: number;
}) {
  const fallback = localizeFallback(locale);
  const filteredFallback = fallback.articles.filter(
    (article) => !categorySlug || article.category?.slug === categorySlug
  );

  return safePublic(async () => {
    const where = {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      ...(categorySlug ? { category: { slug: categorySlug } } : {})
    };

    const [total, articles, categories] = await prisma.$transaction([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        include: {
          translations: true,
          category: { include: { translations: true } }
        },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        skip: (Math.max(page, 1) - 1) * pageSize,
        take: pageSize
      }),
      prisma.category.findMany({
        include: { translations: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      })
    ]);

    return {
      articles: articles.map((article) => toLocalizedArticle(article, locale)),
      categories: categories.map((category) => toLocalizedCategory(category, locale)),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    };
  }, {
    articles: filteredFallback.slice((page - 1) * pageSize, page * pageSize),
    categories: fallback.categories,
    total: filteredFallback.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(filteredFallback.length / pageSize))
  });
}

export async function getRecentArticles(locale: AppLocale, limit = 3) {
  const list = await getArticleList({ locale, pageSize: limit });
  return list.articles.slice(0, limit);
}

export async function getArticleBySlug(locale: AppLocale, slug: string) {
  const fallback = localizeFallback(locale).articles.find((article) => article.slug === slug) || null;
  return safePublic(async () => {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        status: "PUBLISHED",
        publishedAt: { lte: new Date() }
      },
      include: {
        translations: true,
        category: { include: { translations: true } }
      }
    });

    return article ? toLocalizedArticle(article, locale) : null;
  }, fallback);
}

export async function getAllPublishedArticleRoutes() {
  return safePublic(async () => {
    const articles = await prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() }
      },
      select: {
        slug: true,
        updatedAt: true
      }
    });
    return articles;
  }, fallbackArticles.map((article) => ({ slug: article.slug, updatedAt: article.updatedAt })));
}
