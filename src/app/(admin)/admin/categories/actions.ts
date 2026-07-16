"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";
import { getSiteSettings } from "@/lib/settings";
import { categorySchema } from "@/lib/validators";

export async function saveCategoryAction(formData: FormData) {
  await requireAdmin();
  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    slug: formData.get("slug"),
    sortOrder: formData.get("sortOrder")
  });

  if (!parsed.success) {
    redirect("/admin/categories?error=invalid");
  }

  const settings = await getSiteSettings();
  const defaultName = String(
    formData.get(`name_${settings.defaultLocale}`) || ""
  ).trim();

  if (!defaultName) {
    redirect("/admin/categories?error=invalid");
  }

  const currentCategory = parsed.data.id
    ? await prisma.category.findUnique({
        where: { id: parsed.data.id },
        select: { slug: true }
      })
    : null;

  const category = parsed.data.id
    ? await prisma.category.update({
        where: { id: parsed.data.id },
        data: {
          slug: parsed.data.slug,
          sortOrder: parsed.data.sortOrder
        }
      })
    : await prisma.category.create({
        data: {
          slug: parsed.data.slug,
          sortOrder: parsed.data.sortOrder
        }
      });

  for (const locale of settings.supportedLocales) {
    const name = String(formData.get(`name_${locale}`) || "").trim();
    const description = String(
      formData.get(`description_${locale}`) || ""
    ).trim();
    const seoTitle = String(formData.get(`seoTitle_${locale}`) || "").trim();
    const seoDescription = String(
      formData.get(`seoDescription_${locale}`) || ""
    ).trim();
    const seoKeywords = String(
      formData.get(`seoKeywords_${locale}`) || ""
    ).trim();
    if (!name) continue;

    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId: category.id,
          locale
        }
      },
      update: { name, description, seoTitle, seoDescription, seoKeywords },
      create: {
        categoryId: category.id,
        locale,
        name,
        description,
        seoTitle,
        seoDescription,
        seoKeywords
      }
    });
  }

  revalidatePublicContent(undefined, [currentCategory?.slug, category.slug]);
  redirect("/admin/categories?saved=1");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/admin/categories?error=missing");
  }

  const category = await prisma.category.findUnique({
    where: { id },
    select: { slug: true }
  });

  await prisma.article.updateMany({
    where: { categoryId: id },
    data: { categoryId: null }
  });
  await prisma.category.delete({ where: { id } });

  revalidatePublicContent(undefined, category?.slug);
  redirect("/admin/categories?deleted=1");
}
