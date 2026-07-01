import { prisma } from "./db";
import { type PublicSiteSettings } from "./settings";

type SeoSeverity = "严重" | "提醒";

export type SeoPageAudit = {
  url: string;
  title: string;
  type: "基础页面" | "文章" | "分类";
  score: number;
  issues: {
    severity: SeoSeverity;
    message: string;
    suggestion: string;
  }[];
};

function scoreFromIssues(issues: SeoPageAudit["issues"]) {
  const penalty = issues.reduce((total, issue) => total + (issue.severity === "严重" ? 18 : 8), 0);
  return Math.max(0, 100 - penalty);
}

function addLengthIssue({
  issues,
  value,
  label,
  min,
  max
}: {
  issues: SeoPageAudit["issues"];
  value: string | null | undefined;
  label: string;
  min: number;
  max: number;
}) {
  const length = value?.trim().length || 0;
  if (!length) {
    issues.push({
      severity: "严重",
      message: `${label}为空`,
      suggestion: `补充${label}，并保持在 ${min}-${max} 个字符左右。`
    });
    return;
  }

  if (length < min || length > max) {
    issues.push({
      severity: "提醒",
      message: `${label}长度为 ${length} 个字符`,
      suggestion: `建议将${label}控制在 ${min}-${max} 个字符。`
    });
  }
}

function pickTranslation<T extends { locale: string }>(rows: T[], locale: string, defaultLocale: string) {
  return rows.find((row) => row.locale === locale) || rows.find((row) => row.locale === defaultLocale) || rows[0];
}

function route(settings: PublicSiteSettings, locale: string, path = "") {
  return `${settings.siteUrl}/${locale}${path}`;
}

export async function runSeoDoctor(settings: PublicSiteSettings) {
  const audits: SeoPageAudit[] = [];
  const siteIssues: SeoPageAudit["issues"] = [];

  addLengthIssue({
    issues: siteIssues,
    value: settings.seoTitle,
    label: "网站 SEO 标题",
    min: 20,
    max: 70
  });
  addLengthIssue({
    issues: siteIssues,
    value: settings.seoDescription,
    label: "网站 SEO 描述",
    min: 70,
    max: 180
  });

  if (settings.siteUrl.includes("localhost")) {
    siteIssues.push({
      severity: "提醒",
      message: "站点 URL 仍是 localhost",
      suggestion: "上线前改为正式域名，确保 canonical、sitemap 和分享链接正确。"
    });
  }

  if (!settings.ogImage) {
    siteIssues.push({
      severity: "提醒",
      message: "未配置默认 OG 图片",
      suggestion: "上传 1200x630 左右的社交分享图。"
    });
  }

  const staticPages = [
    { path: "", title: "首页" },
    { path: "/about", title: "关于我们" },
    { path: "/services", title: "服务" },
    { path: "/articles", title: "文章列表" },
    { path: "/contact", title: "联系" }
  ];

  for (const locale of settings.supportedLocales) {
    for (const page of staticPages) {
      audits.push({
        url: route(settings, locale, page.path),
        title: `${page.title} (${locale})`,
        type: "基础页面",
        score: scoreFromIssues(siteIssues),
        issues: siteIssues
      });
    }
  }

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: {
        status: "PUBLISHED",
        publishedAt: { lte: new Date() }
      },
      include: {
        translations: true,
        category: { include: { translations: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    }),
    prisma.category.findMany({
      include: { translations: true, _count: { select: { articles: true } } },
      orderBy: [{ sortOrder: "asc" }]
    })
  ]);

  for (const category of categories) {
    for (const locale of settings.supportedLocales) {
      const translation = pickTranslation(category.translations, locale, settings.defaultLocale);
      const issues: SeoPageAudit["issues"] = [];

      addLengthIssue({
        issues,
        value: translation?.name,
        label: "分类名称",
        min: 2,
        max: 60
      });
      addLengthIssue({
        issues,
        value: translation?.description,
        label: "分类描述",
        min: 20,
        max: 160
      });
      addLengthIssue({
        issues,
        value: translation?.seoTitle,
        label: "分类 SEO 标题",
        min: 12,
        max: 70
      });
      addLengthIssue({
        issues,
        value: translation?.seoDescription,
        label: "分类 SEO 描述",
        min: 70,
        max: 180
      });

      if (category._count.articles === 0) {
        issues.push({
          severity: "提醒",
          message: "分类下暂无文章",
          suggestion: "补充相关文章，或暂时隐藏该分类入口。"
        });
      }

      audits.push({
        url: route(settings, locale, `/articles?category=${category.slug}`),
        title: `${translation?.name || category.slug} (${locale})`,
        type: "分类",
        score: scoreFromIssues(issues),
        issues
      });
    }
  }

  for (const article of articles) {
    for (const locale of settings.supportedLocales) {
      const translation = pickTranslation(article.translations, locale, settings.defaultLocale);
      const issues: SeoPageAudit["issues"] = [];

      addLengthIssue({
        issues,
        value: translation?.seoTitle || translation?.title,
        label: "文章 SEO 标题",
        min: 20,
        max: 70
      });
      addLengthIssue({
        issues,
        value: translation?.seoDescription || translation?.summary,
        label: "文章 SEO 描述",
        min: 70,
        max: 180
      });

      if (!translation?.content || translation.content.trim().length < 300) {
        issues.push({
          severity: "提醒",
          message: "正文内容偏短",
          suggestion: "补充更完整的正文，覆盖用户问题、方案、参数或案例。"
        });
      }

      if (translation?.content && !/^##\s+/m.test(translation.content)) {
        issues.push({
          severity: "提醒",
          message: "正文缺少二级标题",
          suggestion: "使用清晰小标题帮助搜索引擎和用户理解结构。"
        });
      }

      if (!article.coverImage) {
        issues.push({
          severity: "提醒",
          message: "缺少封面图",
          suggestion: "上传与文章主题相关的封面图，并用于 Open Graph 分享。"
        });
      }

      if (!article.category) {
        issues.push({
          severity: "提醒",
          message: "文章未绑定分类",
          suggestion: "选择一个相关分类，增强内容聚合和内部链接。"
        });
      }

      audits.push({
        url: route(settings, locale, `/articles/${article.slug}`),
        title: `${translation?.title || article.slug} (${locale})`,
        type: "文章",
        score: scoreFromIssues(issues),
        issues
      });
    }
  }

  const averageScore = audits.length
    ? Math.round(audits.reduce((total, audit) => total + audit.score, 0) / audits.length)
    : 0;
  const totalIssues = audits.reduce((total, audit) => total + audit.issues.length, 0);

  return {
    averageScore,
    totalPages: audits.length,
    totalIssues,
    audits: audits.sort((a, b) => a.score - b.score)
  };
}
