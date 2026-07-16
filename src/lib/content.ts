import type {
  Article,
  ArticleTranslation,
  Category,
  CategoryTranslation
} from "@prisma/client";
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
    description: "柴油、燃气与混合能源解决方案内容，覆盖选型、部署和运维。",
    seoTitle: "工业电力解决方案 | OpenWebsite",
    seoDescription:
      "面向工业企业的柴油发电、燃气发电与混合能源内容，覆盖选型、部署、运维、备用电源规划和项目交付关键问题，帮助团队建立可靠供电方案并规划专题内容。",
    seoKeywords: "工业电力,柴油发电机,燃气发电,备用电源",
    sortOrder: 10
  },
  {
    id: "fallback-service",
    slug: "service-and-projects",
    name: "服务与案例",
    description: "项目交付、维保与工程支持内容，覆盖交付准备和长期运营。",
    seoTitle: "服务与项目案例 | OpenWebsite",
    seoDescription:
      "围绕项目交付、工程支持、维护保养和现场服务的文章集合，覆盖启动准备、交付协同、长期运营和案例复盘，帮助团队降低后期返工风险并沉淀项目案例内容。",
    seoKeywords: "项目交付,维保服务,工程支持,案例",
    sortOrder: 20
  }
];

const fallbackArticles: LocalizedArticle[] = [
  {
    id: "fallback-selection-guide",
    slug: "diesel-generator-selection-guide",
    title: "工业企业如何选择柴油发电机组",
    summary:
      "从功率、负载、冗余、噪音和运维角度，快速建立企业备用电源选型框架。",
    seoTitle: "柴油发电机组选型指南 | OpenWebsite",
    seoDescription:
      "面向工业企业的柴油发电机组选型指南，覆盖功率、负载、冗余、运行时长、现场环境、并机需求、燃油条件和长期运维规划，帮助采购前明确配置边界与服务要求。",
    seoKeywords: "柴油发电机,备用电源,工业电力",
    content:
      "## 先明确负载类型\n\n工业备用电源的核心不是简单放大功率，而是理解负载启动电流、连续运行时长和允许切换时间。\n\n## 现场条件也会改变配置\n\n海拔、环境温度、粉尘、噪音边界、燃油储备和机房通风都会影响机组降容、散热和维护空间。对于需要并机或远程监控的项目，还要提前确认控制系统、通讯协议和备件策略。\n\n## 建议\n\n提供负载清单、现场环境和并机需求，工程团队可以据此输出更准确的配置方案。",
    coverImage: "/images/article-generator-room.png",
    publishedAt: new Date("2026-01-12T08:00:00.000Z"),
    updatedAt: new Date("2026-01-12T08:00:00.000Z"),
    category: fallbackCategories[0]
  },
  {
    id: "fallback-gas-project",
    slug: "gas-power-station-project-readiness",
    title: "燃气电站项目启动前需要准备什么",
    summary:
      "燃气品质、并网要求、现场土建与长期运维，是连续电力项目能否稳定落地的关键。",
    seoTitle: "燃气电站项目准备清单 | OpenWebsite",
    seoDescription:
      "燃气电站项目启动前的准备清单，覆盖气源条件、并网要求、土建边界、散热噪音、备件计划、团队协同和长期运维安排，帮助项目降低交付返工风险并明确各方责任。",
    seoKeywords: "燃气发电,电站项目,连续电力",
    content:
      "## 燃气条件决定系统边界\n\n燃气发电项目首先要确认气源稳定性、热值范围、压力、硫含量和净化条件。这些参数会直接影响发动机选型、维护策略和长期运行成本。\n\n## 项目准备清单\n\n气源检测、并网要求、现场平面、散热噪音边界和长期服务计划都应尽早确认。\n\n## 协同节奏\n\n项目启动阶段应让业主、燃气供应方、土建、电气和运维团队共享边界条件，提前确认接口、审批、设备布置和试运行计划。\n\n## 运维边界\n\n项目还需要明确巡检周期、备件库存、远程监控、燃气波动应急方案和服务响应时间。这些安排会影响长期可用率，也能帮助合同和交付团队提前划分责任。",
    coverImage: "/images/article-gas-station.png",
    publishedAt: new Date("2026-02-20T08:00:00.000Z"),
    updatedAt: new Date("2026-02-20T08:00:00.000Z"),
    category: fallbackCategories[1]
  }
];

const fallbackArticlesEn: Record<string, Partial<LocalizedArticle>> = {
  "diesel-generator-selection-guide": {
    title: "How industrial teams choose diesel generator sets",
    summary:
      "A practical framework for sizing standby power across load, redundancy and service needs.",
    seoTitle: "Diesel Generator Selection Guide | OpenWebsite",
    seoDescription:
      "A practical diesel generator selection guide for industrial companies, covering load sizing, redundancy, runtime, and service planning.",
    seoKeywords: "diesel generator,standby power,industrial power",
    content:
      "## Start with the load profile\n\nReliable standby power is not only about oversizing capacity. Teams need to understand starting current, runtime, transfer time and redundancy requirements.\n\n## Recommendation\n\nShare the load list, altitude, ambient temperature and paralleling needs so engineering can recommend the right configuration."
  },
  "gas-power-station-project-readiness": {
    title: "What to prepare before a gas power station project",
    summary:
      "Gas quality, grid requirements, civil works and service planning determine project readiness.",
    seoTitle: "Gas Power Station Readiness Checklist | OpenWebsite",
    seoDescription:
      "Gas power station readiness checklist covering gas supply, grid requirements, civil works, service planning, and delivery risk reduction.",
    seoKeywords: "gas power,power station,continuous power",
    content:
      "## Gas conditions define the system\n\nGas power projects start with stable supply, heating value, pressure, sulfur content and treatment conditions.\n\n## Project checklist\n\nConfirm gas reports, grid requirements, site layout, cooling, noise limits and long-term service planning."
  }
};

const fallbackCategoriesEn: Record<string, Partial<LocalizedCategory>> = {
  "industrial-power": {
    name: "Industrial Power",
    description: "Diesel, gas and hybrid power solutions.",
    seoTitle: "Industrial Power Solutions | OpenWebsite",
    seoDescription:
      "Diesel generator, gas power, hybrid energy, standby power, and project planning content for industrial teams.",
    seoKeywords: "industrial power,diesel generator,gas power,standby power"
  },
  "service-and-projects": {
    name: "Service & Projects",
    description: "Delivery, maintenance and engineering support.",
    seoTitle: "Service and Project Case Studies | OpenWebsite",
    seoDescription:
      "Articles about project delivery, engineering support, maintenance planning, and service operations for reliable sites.",
    seoKeywords: "project delivery,maintenance,engineering support,case studies"
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

function toLocalizedCategory(
  row: CategoryWithTranslations,
  locale: AppLocale
): LocalizedCategory {
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

function toLocalizedArticle(
  row: ArticleWithRelations,
  locale: AppLocale
): LocalizedArticle {
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

async function safePublic<T>(
  operation: () => Promise<T>,
  fallback: T
): Promise<T> {
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

  return safePublic(
    async () => {
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
        articles: articles.map((article) =>
          toLocalizedArticle(article, locale)
        ),
        categories: categories.map((category) =>
          toLocalizedCategory(category, locale)
        ),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize))
      };
    },
    {
      articles: filteredFallback.slice((page - 1) * pageSize, page * pageSize),
      categories: fallback.categories,
      total: filteredFallback.length,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(filteredFallback.length / pageSize))
    }
  );
}

export async function getRecentArticles(locale: AppLocale, limit = 3) {
  const list = await getArticleList({ locale, pageSize: limit });
  return list.articles.slice(0, limit);
}

export async function getArticleBySlug(locale: AppLocale, slug: string) {
  const fallback =
    localizeFallback(locale).articles.find(
      (article) => article.slug === slug
    ) || null;
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
  return safePublic(
    async () => {
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
    },
    fallbackArticles.map((article) => ({
      slug: article.slug,
      updatedAt: article.updatedAt
    }))
  );
}

export async function getAllCategoryRoutes() {
  return safePublic(
    async () => {
      const categories = await prisma.category.findMany({
        select: {
          slug: true,
          updatedAt: true
        },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
      });
      return categories;
    },
    fallbackCategories.map((category) => ({
      slug: category.slug,
      updatedAt: new Date("2026-01-01T08:00:00.000Z")
    }))
  );
}
