import { z } from "zod";
import { getEffectiveAiConfiguration } from "./ai-configuration";
import { prisma } from "./db";
import { runSeoDoctor, type SeoPageAudit } from "./seo-doctor";
import {
  SITE_SETTINGS_ID,
  getSiteSettings,
  siteSettingsFromRow,
  syncSiteSettingsSnapshot
} from "./settings";

type TranslationRow = {
  locale: string;
};

type SeoFixTask =
  | {
      target: "site";
      id: string;
      issues: string[];
      context: {
        siteName: string;
        siteUrl: string;
        defaultLocale: string;
        supportedLocales: string[];
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string;
      };
    }
  | {
      target: "category";
      id: string;
      locale: string;
      issues: string[];
      context: {
        slug: string;
        name: string;
        description: string;
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string;
        articleCount: number;
      };
    }
  | {
      target: "article";
      id: string;
      locale: string;
      issues: string[];
      context: {
        slug: string;
        title: string;
        summary: string;
        content: string;
        seoTitle: string;
        seoDescription: string;
        seoKeywords: string;
        categoryName: string;
      };
    };

const seoFixResponseSchema = z.object({
  site: z
    .object({
      seoTitle: z.string().optional(),
      seoDescription: z.string().optional(),
      seoKeywords: z.string().optional()
    })
    .optional(),
  categories: z
    .array(
      z.object({
        id: z.string(),
        locale: z.string(),
        description: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional()
      })
    )
    .optional(),
  articles: z
    .array(
      z.object({
        id: z.string(),
        locale: z.string(),
        summary: z.string().optional(),
        content: z.string().optional(),
        seoTitle: z.string().optional(),
        seoDescription: z.string().optional(),
        seoKeywords: z.string().optional()
      })
    )
    .optional()
});

function pickTranslation<T extends TranslationRow>(
  rows: T[],
  locale: string,
  defaultLocale: string
) {
  return (
    rows.find((row) => row.locale === locale) ||
    rows.find((row) => row.locale === defaultLocale) ||
    rows[0]
  );
}

function uniqueFixTargets(audits: SeoPageAudit[]) {
  const targets = new Map<string, SeoPageAudit>();

  for (const audit of audits) {
    if (!audit.fixableIssues) continue;

    const key =
      audit.target.kind === "site"
        ? "site:default"
        : `${audit.target.kind}:${audit.target.id}:${audit.target.locale}`;

    if (!targets.has(key) || audit.score < targets.get(key)!.score) {
      targets.set(key, audit);
    }
  }

  return [...targets.values()];
}

function issueLabels(audit: SeoPageAudit) {
  return audit.issues
    .filter((issue) => issue.fixable)
    .map((issue) => `${issue.code}: ${issue.message}。${issue.suggestion}`);
}

function compactContent(value: string) {
  const normalized = value.trim();
  if (normalized.length <= 5000) {
    return normalized;
  }

  return `${normalized.slice(0, 2600)}\n\n...\n\n${normalized.slice(-1800)}`;
}

async function buildFixTasks(audits: SeoPageAudit[]) {
  const settings = await getSiteSettings();
  const targets = uniqueFixTargets(audits);
  const [categories, articles] = await Promise.all([
    prisma.category.findMany({
      include: { translations: true, _count: { select: { articles: true } } }
    }),
    prisma.article.findMany({
      include: {
        translations: true,
        category: { include: { translations: true } }
      }
    })
  ]);

  const categoriesById = new Map(
    categories.map((category) => [category.id, category])
  );
  const articlesById = new Map(
    articles.map((article) => [article.id, article])
  );
  const tasks: SeoFixTask[] = [];

  for (const audit of targets) {
    if (audit.target.kind === "site") {
      tasks.push({
        target: "site",
        id: SITE_SETTINGS_ID,
        issues: issueLabels(audit),
        context: {
          siteName: settings.siteName,
          siteUrl: settings.siteUrl,
          defaultLocale: settings.defaultLocale,
          supportedLocales: settings.supportedLocales,
          seoTitle: settings.seoTitle,
          seoDescription: settings.seoDescription,
          seoKeywords: settings.seoKeywords
        }
      });
      continue;
    }

    if (audit.target.kind === "category") {
      const category = categoriesById.get(audit.target.id);
      if (!category) continue;

      const translation = pickTranslation(
        category.translations,
        audit.target.locale,
        settings.defaultLocale
      );
      tasks.push({
        target: "category",
        id: category.id,
        locale: audit.target.locale,
        issues: issueLabels(audit),
        context: {
          slug: category.slug,
          name: translation?.name || category.slug,
          description: translation?.description || "",
          seoTitle: translation?.seoTitle || "",
          seoDescription: translation?.seoDescription || "",
          seoKeywords: translation?.seoKeywords || "",
          articleCount: category._count.articles
        }
      });
      continue;
    }

    const article = articlesById.get(audit.target.id);
    if (!article) continue;

    const translation = pickTranslation(
      article.translations,
      audit.target.locale,
      settings.defaultLocale
    );
    const categoryTranslation = article.category
      ? pickTranslation(
          article.category.translations,
          audit.target.locale,
          settings.defaultLocale
        )
      : null;

    tasks.push({
      target: "article",
      id: article.id,
      locale: audit.target.locale,
      issues: issueLabels(audit),
      context: {
        slug: article.slug,
        title: translation?.title || article.slug,
        summary: translation?.summary || "",
        content: compactContent(translation?.content || ""),
        seoTitle: translation?.seoTitle || "",
        seoDescription: translation?.seoDescription || "",
        seoKeywords: translation?.seoKeywords || "",
        categoryName: categoryTranslation?.name || article.category?.slug || ""
      }
    });
  }

  return tasks;
}

function extractJsonObject(raw: string) {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("AI response did not contain a JSON object.");
  }

  return JSON.parse(trimmed.slice(start, end + 1));
}

function sanitizeLine(value: string | undefined, max: number) {
  const normalized = value?.replace(/\s+/g, " ").trim() || "";
  return normalized.slice(0, max);
}

function sanitizeBlock(value: string | undefined, max: number) {
  return (value || "").trim().slice(0, max);
}

async function requestSeoFixes(tasks: SeoFixTask[]) {
  const config = await getEffectiveAiConfiguration();

  if (!config) {
    throw new Error("AI configuration is missing or disabled.");
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${config.apiKey}`,
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      messages: [
        {
          role: "system",
          content:
            "You are a senior multilingual SEO editor. Return strict JSON only. Do not include Markdown fences, commentary, or fields not requested."
        },
        {
          role: "user",
          content: JSON.stringify({
            instructions: [
              "Fix only the fields represented by each task. Preserve factual meaning and product positioning.",
              "Keep seoTitle concise: 20-70 characters when possible.",
              "Keep seoDescription useful for search snippets: 70-180 characters when possible.",
              "Keep seoKeywords comma-separated and short.",
              "For article content, return content only when the task mentions short body or missing h2. Use Markdown with clear ## headings.",
              "Respond with shape: { site?: {...}, categories?: [...], articles?: [...] }."
            ],
            tasks
          })
        }
      ]
    }),
    signal: AbortSignal.timeout(90000)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `AI request failed: ${response.status} ${text.slice(0, 500)}`
    );
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI response was empty.");
  }

  return seoFixResponseSchema.parse(extractJsonObject(content));
}

export async function runSeoAutoFix() {
  const settings = await getSiteSettings();
  const before = await runSeoDoctor(settings);
  const tasks = await buildFixTasks(before.audits);

  if (!tasks.length) {
    return {
      averageScoreBefore: before.averageScore,
      averageScoreAfter: before.averageScore,
      totalIssuesBefore: before.totalIssues,
      totalIssuesAfter: before.totalIssues,
      changedFields: 0,
      fixedTargets: 0
    };
  }

  const fixes = await requestSeoFixes(tasks);
  let changedFields = 0;
  const fixedTargets = new Set<string>();

  if (fixes.site) {
    const row = await prisma.siteSetting.upsert({
      where: { id: SITE_SETTINGS_ID },
      update: {
        seoTitle: sanitizeLine(fixes.site.seoTitle, 120) || settings.seoTitle,
        seoDescription:
          sanitizeLine(fixes.site.seoDescription, 320) ||
          settings.seoDescription,
        seoKeywords:
          sanitizeLine(fixes.site.seoKeywords, 320) || settings.seoKeywords
      },
      create: {
        id: SITE_SETTINGS_ID,
        siteName: settings.siteName,
        siteUrl: settings.siteUrl,
        defaultLocale: settings.defaultLocale,
        supportedLocales: settings.supportedLocales.join(","),
        seoTitle: sanitizeLine(fixes.site.seoTitle, 120) || settings.seoTitle,
        seoDescription:
          sanitizeLine(fixes.site.seoDescription, 320) ||
          settings.seoDescription,
        seoKeywords:
          sanitizeLine(fixes.site.seoKeywords, 320) || settings.seoKeywords,
        ogImage: settings.ogImage || null
      }
    });

    await syncSiteSettingsSnapshot(siteSettingsFromRow(row));
    changedFields += Object.values(fixes.site).filter(Boolean).length;
    fixedTargets.add("site:default");
  }

  const categoryTasks = new Map(
    tasks
      .filter(
        (task): task is Extract<SeoFixTask, { target: "category" }> =>
          task.target === "category"
      )
      .map((task) => [`${task.id}:${task.locale}`, task])
  );

  for (const fix of fixes.categories || []) {
    const task = categoryTasks.get(`${fix.id}:${fix.locale}`);
    if (!task) continue;

    const data: {
      description?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
    } = {};
    const description = sanitizeBlock(fix.description, 220);
    const seoTitle = sanitizeLine(fix.seoTitle, 120);
    const seoDescription = sanitizeLine(fix.seoDescription, 320);
    const seoKeywords = sanitizeLine(fix.seoKeywords, 320);

    if (description) data.description = description;
    if (seoTitle) data.seoTitle = seoTitle;
    if (seoDescription) data.seoDescription = seoDescription;
    if (seoKeywords) data.seoKeywords = seoKeywords;

    if (!Object.keys(data).length) continue;

    await prisma.categoryTranslation.upsert({
      where: {
        categoryId_locale: {
          categoryId: fix.id,
          locale: fix.locale
        }
      },
      update: data,
      create: {
        categoryId: fix.id,
        locale: fix.locale,
        name: task.context.name || task.context.slug,
        description: data.description || task.context.description,
        seoTitle: data.seoTitle || task.context.seoTitle,
        seoDescription: data.seoDescription || task.context.seoDescription,
        seoKeywords: data.seoKeywords || task.context.seoKeywords,
        ...data
      }
    });

    changedFields += Object.keys(data).length;
    fixedTargets.add(`category:${fix.id}:${fix.locale}`);
  }

  const articleTasks = new Map(
    tasks
      .filter(
        (task): task is Extract<SeoFixTask, { target: "article" }> =>
          task.target === "article"
      )
      .map((task) => [`${task.id}:${task.locale}`, task])
  );

  for (const fix of fixes.articles || []) {
    const task = articleTasks.get(`${fix.id}:${fix.locale}`);
    if (!task) continue;

    const data: {
      summary?: string;
      content?: string;
      seoTitle?: string;
      seoDescription?: string;
      seoKeywords?: string;
    } = {};
    const summary = sanitizeBlock(fix.summary, 500);
    const content = sanitizeBlock(fix.content, 12000);
    const seoTitle = sanitizeLine(fix.seoTitle, 120);
    const seoDescription = sanitizeLine(fix.seoDescription, 320);
    const seoKeywords = sanitizeLine(fix.seoKeywords, 320);

    if (summary) data.summary = summary;
    if (content) data.content = content;
    if (seoTitle) data.seoTitle = seoTitle;
    if (seoDescription) data.seoDescription = seoDescription;
    if (seoKeywords) data.seoKeywords = seoKeywords;

    if (!Object.keys(data).length) continue;

    await prisma.articleTranslation.upsert({
      where: {
        articleId_locale: {
          articleId: fix.id,
          locale: fix.locale
        }
      },
      update: data,
      create: {
        articleId: fix.id,
        locale: fix.locale,
        title: task.context.title || task.context.slug,
        summary: data.summary || task.context.summary,
        content: data.content || task.context.content,
        seoTitle: data.seoTitle || task.context.seoTitle,
        seoDescription: data.seoDescription || task.context.seoDescription,
        seoKeywords: data.seoKeywords || task.context.seoKeywords,
        ...data
      }
    });

    changedFields += Object.keys(data).length;
    fixedTargets.add(`article:${fix.id}:${fix.locale}`);
  }

  const afterSettings = await getSiteSettings();
  const after = await runSeoDoctor(afterSettings);

  return {
    averageScoreBefore: before.averageScore,
    averageScoreAfter: after.averageScore,
    totalIssuesBefore: before.totalIssues,
    totalIssuesAfter: after.totalIssues,
    changedFields,
    fixedTargets: fixedTargets.size
  };
}
