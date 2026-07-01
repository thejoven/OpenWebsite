import { z } from "zod";

export const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(5).max(4000),
  sourcePage: z.string().trim().max(240).optional().or(z.literal(""))
});

export const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  captchaToken: z.string().min(1),
  captchaAnswer: z.string().trim().min(1).max(4)
});

export const categorySchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  sortOrder: z.coerce.number().int().min(0).max(9999)
});

export const siteSettingsSchema = z.object({
  siteName: z.string().trim().min(1).max(120),
  siteUrl: z.string().trim().url().max(240),
  defaultLocale: z.string().trim().min(2).max(12),
  supportedLocales: z.string().trim().min(2).max(160),
  seoTitle: z.string().trim().min(1).max(120),
  seoDescription: z.string().trim().min(1).max(320),
  seoKeywords: z.string().trim().max(320).optional().or(z.literal("")),
  ogImage: z.string().trim().max(300).optional().or(z.literal(""))
});

export const adminUserSchema = z.object({
  id: z.string().optional(),
  email: z.string().trim().email().max(160),
  password: z.string().max(128).optional().or(z.literal(""))
});

export const scheduledTaskSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1).max(120),
  schedule: z.string().trim().min(1).max(120),
  status: z.enum(["ACTIVE", "PAUSED"]),
  description: z.string().trim().max(500).optional().or(z.literal(""))
});

export const articleSchema = z.object({
  id: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(160)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  categoryId: z.string().optional().or(z.literal("")),
  coverImage: z.string().trim().max(300).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  publishedAt: z.string().optional().or(z.literal(""))
});
