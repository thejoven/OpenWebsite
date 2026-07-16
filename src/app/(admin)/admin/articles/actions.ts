"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";
import { getSiteSettings } from "@/lib/settings";
import { articleSchema } from "@/lib/validators";

export async function saveArticleAction(formData: FormData) {
  await requireAdmin();
  const parsed = articleSchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId") || "",
    coverImage: formData.get("coverImage") || "",
    status: formData.get("status"),
    publishedAt: formData.get("publishedAt") || ""
  });

  if (!parsed.success) {
    redirect("/admin/articles?error=invalid");
  }

  const settings = await getSiteSettings();
  const defaultTitle = String(
    formData.get(`title_${settings.defaultLocale}`) || ""
  ).trim();

  if (!defaultTitle) {
    redirect("/admin/articles?error=invalid");
  }

  const publishedAtValue = parsed.data.publishedAt
    ? new Date(parsed.data.publishedAt)
    : parsed.data.status === "PUBLISHED"
      ? new Date()
      : null;

  const [currentArticle, nextCategory] = await Promise.all([
    parsed.data.id
      ? prisma.article.findUnique({
          where: { id: parsed.data.id },
          select: {
            slug: true,
            category: { select: { slug: true } }
          }
        })
      : null,
    parsed.data.categoryId
      ? prisma.category.findUnique({
          where: { id: parsed.data.categoryId },
          select: { slug: true }
        })
      : null
  ]);

  const article = parsed.data.id
    ? await prisma.article.update({
        where: { id: parsed.data.id },
        data: {
          slug: parsed.data.slug,
          categoryId: parsed.data.categoryId || null,
          coverImage: parsed.data.coverImage || null,
          status: parsed.data.status,
          publishedAt: publishedAtValue
        }
      })
    : await prisma.article.create({
        data: {
          slug: parsed.data.slug,
          categoryId: parsed.data.categoryId || null,
          coverImage: parsed.data.coverImage || null,
          status: parsed.data.status,
          publishedAt: publishedAtValue
        }
      });

  for (const locale of settings.supportedLocales) {
    const title = String(formData.get(`title_${locale}`) || "").trim();
    const summary = String(formData.get(`summary_${locale}`) || "").trim();
    const content = String(formData.get(`content_${locale}`) || "").trim();
    const seoTitle = String(formData.get(`seoTitle_${locale}`) || "").trim();
    const seoDescription = String(
      formData.get(`seoDescription_${locale}`) || ""
    ).trim();
    const seoKeywords = String(
      formData.get(`seoKeywords_${locale}`) || ""
    ).trim();

    if (!title && locale !== settings.defaultLocale) {
      continue;
    }

    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId: article.id,
          locale
        }
      },
      update: {
        title: title || parsed.data.slug,
        summary,
        content,
        seoTitle,
        seoDescription,
        seoKeywords
      },
      create: {
        articleId: article.id,
        locale,
        title: title || parsed.data.slug,
        summary,
        content,
        seoTitle,
        seoDescription,
        seoKeywords
      }
    });
  }

  revalidatePublicContent(
    [currentArticle?.slug, article.slug],
    [currentArticle?.category?.slug, nextCategory?.slug]
  );
  redirect(`/admin/articles/${article.id}?saved=1`);
}

export async function deleteArticleAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  const slug = String(formData.get("slug") || "");
  if (!id) {
    redirect("/admin/articles?error=missing");
  }

  const article = await prisma.article.findUnique({
    where: { id },
    select: { category: { select: { slug: true } } }
  });

  await prisma.article.delete({ where: { id } });
  revalidatePublicContent(slug, article?.category?.slug);
  redirect("/admin/articles?deleted=1");
}
