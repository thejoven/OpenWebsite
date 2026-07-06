"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { revalidatePublicContent } from "@/lib/revalidate";
import { AI_CONFIGURATION_ID } from "@/lib/ai-configuration";
import {
  SITE_SETTINGS_ID,
  normalizeLocales,
  serializeLocales,
  siteSettingsFromRow,
  syncSiteSettingsSnapshot,
  trimTrailingSlash
} from "@/lib/settings";
import {
  aiConfigurationSchema,
  adminUserSchema,
  scheduledTaskSchema,
  siteSettingsSchema
} from "@/lib/validators";

export async function saveSiteSettingsAction(formData: FormData) {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse({
    siteName: formData.get("siteName"),
    siteUrl: formData.get("siteUrl"),
    defaultLocale: formData.get("defaultLocale"),
    supportedLocales: formData.get("supportedLocales"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    seoKeywords: formData.get("seoKeywords") || "",
    ogImage: formData.get("ogImage") || ""
  });

  if (!parsed.success) {
    redirect("/admin/system?error=settings");
  }

  const supportedLocales = normalizeLocales(parsed.data.supportedLocales);
  if (!supportedLocales.length) {
    redirect("/admin/system?error=locales");
  }

  const requestedDefault = parsed.data.defaultLocale.trim().toLowerCase();
  const defaultLocale = supportedLocales.includes(requestedDefault)
    ? requestedDefault
    : supportedLocales[0];

  const row = await prisma.siteSetting.upsert({
    where: { id: SITE_SETTINGS_ID },
    update: {
      siteName: parsed.data.siteName,
      siteUrl: trimTrailingSlash(parsed.data.siteUrl),
      defaultLocale,
      supportedLocales: serializeLocales(supportedLocales),
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      seoKeywords: parsed.data.seoKeywords || null,
      ogImage: parsed.data.ogImage || null
    },
    create: {
      id: SITE_SETTINGS_ID,
      siteName: parsed.data.siteName,
      siteUrl: trimTrailingSlash(parsed.data.siteUrl),
      defaultLocale,
      supportedLocales: serializeLocales(supportedLocales),
      seoTitle: parsed.data.seoTitle,
      seoDescription: parsed.data.seoDescription,
      seoKeywords: parsed.data.seoKeywords || null,
      ogImage: parsed.data.ogImage || null
    }
  });

  try {
    await syncSiteSettingsSnapshot(siteSettingsFromRow(row));
  } catch (error) {
    console.warn("Unable to sync generated site settings:", error);
  }

  revalidatePublicContent();
  redirect("/admin/system?saved=settings");
}

export async function saveAiConfigurationAction(formData: FormData) {
  await requireAdmin();
  const parsed = aiConfigurationSchema.safeParse({
    providerName: formData.get("providerName"),
    baseUrl: formData.get("baseUrl"),
    model: formData.get("model"),
    apiKey: formData.get("apiKey") || "",
    temperature: formData.get("temperature"),
    enabled: formData.get("enabled") === "on" ? "on" : "off"
  });

  if (!parsed.success) {
    redirect("/admin/system/ai?error=ai");
  }

  const current = await prisma.aiConfiguration.findUnique({
    where: { id: AI_CONFIGURATION_ID }
  });
  const apiKey = parsed.data.apiKey || current?.apiKey || null;

  await prisma.aiConfiguration.upsert({
    where: { id: AI_CONFIGURATION_ID },
    update: {
      providerName: parsed.data.providerName,
      baseUrl: trimTrailingSlash(parsed.data.baseUrl),
      model: parsed.data.model,
      apiKey,
      temperature: parsed.data.temperature,
      enabled: parsed.data.enabled === "on"
    },
    create: {
      id: AI_CONFIGURATION_ID,
      providerName: parsed.data.providerName,
      baseUrl: trimTrailingSlash(parsed.data.baseUrl),
      model: parsed.data.model,
      apiKey,
      temperature: parsed.data.temperature,
      enabled: parsed.data.enabled === "on"
    }
  });

  redirect("/admin/system/ai?saved=ai");
}

export async function saveAdminUserAction(formData: FormData) {
  await requireAdmin();
  const parsed = adminUserSchema.safeParse({
    id: formData.get("id") || undefined,
    email: formData.get("email"),
    password: formData.get("password") || ""
  });

  if (!parsed.success) {
    redirect("/admin/system/admins?error=admin");
  }

  const password = parsed.data.password?.trim() || "";
  if (!parsed.data.id && password.length < 8) {
    redirect("/admin/system/admins?error=password");
  }

  try {
    if (parsed.data.id) {
      await prisma.user.update({
        where: { id: parsed.data.id },
        data: {
          email: parsed.data.email,
          ...(password ? { passwordHash: hashPassword(password) } : {})
        }
      });
    } else {
      await prisma.user.create({
        data: {
          email: parsed.data.email,
          passwordHash: hashPassword(password),
          role: "ADMIN"
        }
      });
    }
  } catch {
    redirect("/admin/system/admins?error=admin");
  }

  redirect("/admin/system/admins?saved=admin");
}

export async function deleteAdminUserAction(formData: FormData) {
  const session = await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id || id === session.userId) {
    redirect("/admin/system/admins?error=delete-admin");
  }

  const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
  if (adminCount <= 1) {
    redirect("/admin/system/admins?error=last-admin");
  }

  await prisma.user.delete({ where: { id } });
  redirect("/admin/system/admins?saved=admin");
}

export async function saveScheduledTaskAction(formData: FormData) {
  await requireAdmin();
  const parsed = scheduledTaskSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    schedule: formData.get("schedule"),
    status: formData.get("status"),
    description: formData.get("description") || ""
  });

  if (!parsed.success) {
    redirect("/admin/system/tasks?error=task");
  }

  await prisma.scheduledTask.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      schedule: parsed.data.schedule,
      status: parsed.data.status,
      description: parsed.data.description || null
    }
  });

  redirect("/admin/system/tasks?saved=task");
}
