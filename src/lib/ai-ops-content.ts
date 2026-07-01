import type {
  Article,
  ArticleTranslation,
  Category,
  CategoryTranslation,
  SiteSetting
} from "@prisma/client";
import { prisma } from "./db";
import {
  SITE_SETTINGS_ID,
  normalizeLocales,
  serializeLocales,
  siteSettingsFromRow,
  syncSiteSettingsSnapshot,
  trimTrailingSlash
} from "./settings";

export type TranslationPayload = Record<string, Record<string, unknown>>;

export type CategoryPayload = {
  slug?: unknown;
  sortOrder?: unknown;
  translations?: TranslationPayload;
};

export type ArticlePayload = {
  id?: unknown;
  slug?: unknown;
  categoryId?: unknown;
  categorySlug?: unknown;
  coverImage?: unknown;
  status?: unknown;
  publishedAt?: unknown;
  translations?: TranslationPayload;
};

type CategoryWithTranslations = Category & {
  translations: CategoryTranslation[];
};

type ArticleWithRelations = Article & {
  translations: ArticleTranslation[];
  category:
    | (Category & {
        translations: CategoryTranslation[];
      })
    | null;
};

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

function asOptionalString(value: unknown) {
  const stringValue = asString(value);
  return stringValue || null;
}

function asNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function asStatus(value: unknown) {
  return value === "PUBLISHED" ? "PUBLISHED" : "DRAFT";
}

function translationMap<T extends { locale: string }>(translations: T[]) {
  return Object.fromEntries(translations.map((translation) => [translation.locale, translation]));
}

export function serializeCategory(category: CategoryWithTranslations) {
  return {
    id: category.id,
    slug: category.slug,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
    translations: translationMap(
      category.translations.map((translation) => ({
        locale: translation.locale,
        name: translation.name,
        description: translation.description,
        seoTitle: translation.seoTitle,
        seoDescription: translation.seoDescription,
        seoKeywords: translation.seoKeywords
      }))
    )
  };
}

export function serializeArticle(article: ArticleWithRelations) {
  return {
    id: article.id,
    slug: article.slug,
    categoryId: article.categoryId,
    categorySlug: article.category?.slug || null,
    coverImage: article.coverImage,
    status: article.status,
    publishedAt: article.publishedAt?.toISOString() || null,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
    category: article.category ? serializeCategory(article.category) : null,
    translations: translationMap(
      article.translations.map((translation) => ({
        locale: translation.locale,
        title: translation.title,
        summary: translation.summary,
        content: translation.content,
        seoTitle: translation.seoTitle,
        seoDescription: translation.seoDescription,
        seoKeywords: translation.seoKeywords
      }))
    )
  };
}

export function serializeSiteSettings(settings: SiteSetting | null) {
  return siteSettingsFromRow(settings);
}

export async function upsertSiteSettingsFromJson(payload: Record<string, unknown>) {
  const supportedLocales = normalizeLocales(
    typeof payload.supportedLocales === "string" || Array.isArray(payload.supportedLocales)
      ? payload.supportedLocales
      : ""
  );
  const defaultLocale = asString(payload.defaultLocale, supportedLocales[0] || "zh").toLowerCase();
  const normalizedDefault = supportedLocales.includes(defaultLocale)
    ? defaultLocale
    : supportedLocales[0] || "zh";

  const row = await prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {
      siteName: asString(payload.siteName, "OpenWebsite"),
      siteUrl: trimTrailingSlash(asString(payload.siteUrl, "http://localhost:3000")),
      defaultLocale: normalizedDefault,
      supportedLocales: serializeLocales(supportedLocales.length ? supportedLocales : [normalizedDefault]),
      seoTitle: asOptionalString(payload.seoTitle),
      seoDescription: asOptionalString(payload.seoDescription),
      seoKeywords: asOptionalString(payload.seoKeywords),
      ogImage: asOptionalString(payload.ogImage)
    },
    create: {
      id: SITE_SETTINGS_ID,
      siteName: asString(payload.siteName, "OpenWebsite"),
      siteUrl: trimTrailingSlash(asString(payload.siteUrl, "http://localhost:3000")),
      defaultLocale: normalizedDefault,
      supportedLocales: serializeLocales(supportedLocales.length ? supportedLocales : [normalizedDefault]),
      seoTitle: asOptionalString(payload.seoTitle),
      seoDescription: asOptionalString(payload.seoDescription),
      seoKeywords: asOptionalString(payload.seoKeywords),
      ogImage: asOptionalString(payload.ogImage)
    }
  });

  await syncSiteSettingsSnapshot(siteSettingsFromRow(row));
  return row;
}

export async function upsertCategoryFromJson(payload: CategoryPayload) {
  const slug = asString(payload.slug);
  if (!slug) {
    throw new Error("Category slug is required.");
  }
  const hasSortOrder = payload.sortOrder !== undefined && payload.sortOrder !== null;

  const category = await prisma.category.upsert({
    where: { slug },
    update: {
      ...(hasSortOrder ? { sortOrder: asNumber(payload.sortOrder) } : {})
    },
    create: {
      slug,
      sortOrder: asNumber(payload.sortOrder)
    }
  });

  const translations = payload.translations || {};
  for (const [locale, translation] of Object.entries(translations)) {
    const name = asString(translation.name);
    if (!name) continue;

    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId: category.id,
          locale
        }
      },
      update: {
        name,
        description: asOptionalString(translation.description),
        seoTitle: asOptionalString(translation.seoTitle),
        seoDescription: asOptionalString(translation.seoDescription),
        seoKeywords: asOptionalString(translation.seoKeywords)
      },
      create: {
        categoryId: category.id,
        locale,
        name,
        description: asOptionalString(translation.description),
        seoTitle: asOptionalString(translation.seoTitle),
        seoDescription: asOptionalString(translation.seoDescription),
        seoKeywords: asOptionalString(translation.seoKeywords)
      }
    });
  }

  return prisma.category.findUniqueOrThrow({
    where: { id: category.id },
    include: { translations: true }
  });
}

export async function upsertArticleFromJson(payload: ArticlePayload) {
  const id = asString(payload.id);
  const slug = asString(payload.slug);
  if (!id && !slug) {
    throw new Error("Article id or slug is required.");
  }

  const existing = id
    ? await prisma.article.findUnique({ where: { id } })
    : slug
      ? await prisma.article.findUnique({ where: { slug } })
      : null;
  const requestedStatus = payload.status === undefined ? existing?.status || "DRAFT" : asStatus(payload.status);
  const categoryId =
    asString(payload.categoryId) ||
    (asString(payload.categorySlug)
      ? (
          await prisma.category.findUnique({
            where: { slug: asString(payload.categorySlug) },
            select: { id: true }
          })
        )?.id || ""
      : existing?.categoryId || "");

  const publishedAt =
    payload.publishedAt !== undefined
      ? asString(payload.publishedAt)
        ? new Date(asString(payload.publishedAt))
        : null
      : existing?.publishedAt || (requestedStatus === "PUBLISHED" && !existing ? new Date() : null);
  const coverImage =
    payload.coverImage === undefined ? existing?.coverImage || null : asOptionalString(payload.coverImage);

  const article = id
    ? await prisma.article.update({
        where: { id },
        data: {
          ...(slug ? { slug } : {}),
          categoryId: categoryId || null,
          coverImage,
          status: requestedStatus,
          publishedAt
        }
      })
    : await prisma.article.upsert({
        where: { slug },
        update: {
          categoryId: categoryId || null,
          coverImage,
          status: requestedStatus,
          publishedAt
        },
        create: {
          slug,
          categoryId: categoryId || null,
          coverImage,
          status: requestedStatus,
          publishedAt
        }
      });

  const translations = payload.translations || {};
  for (const [locale, translation] of Object.entries(translations)) {
    const title = asString(translation.title);
    if (!title) continue;

    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId: article.id,
          locale
        }
      },
      update: {
        title,
        summary: asString(translation.summary),
        content: asString(translation.content),
        seoTitle: asOptionalString(translation.seoTitle),
        seoDescription: asOptionalString(translation.seoDescription),
        seoKeywords: asOptionalString(translation.seoKeywords)
      },
      create: {
        articleId: article.id,
        locale,
        title,
        summary: asString(translation.summary),
        content: asString(translation.content),
        seoTitle: asOptionalString(translation.seoTitle),
        seoDescription: asOptionalString(translation.seoDescription),
        seoKeywords: asOptionalString(translation.seoKeywords)
      }
    });
  }

  return prisma.article.findUniqueOrThrow({
    where: { id: article.id },
    include: {
      translations: true,
      category: { include: { translations: true } }
    }
  });
}
