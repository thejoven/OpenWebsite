import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const prisma = new PrismaClient();

const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const keyLength = 64;

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, keyLength).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

async function main() {
  await prisma.siteSetting.upsert({
    where: { id: "default" },
    update: {
      siteName: process.env.SITE_NAME || "OpenWebsite",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000",
      defaultLocale: process.env.DEFAULT_LOCALE || "zh",
      supportedLocales: process.env.SUPPORTED_LOCALES || "zh,en",
      seoTitle: process.env.SITE_SEO_TITLE || "OpenWebsite | SEO-first company website system",
      seoDescription:
        process.env.SITE_DESCRIPTION ||
        "An SEO-first open-source company website system powered by Next.js.",
      seoKeywords: process.env.SITE_KEYWORDS || "company website, SEO, Next.js, OpenWebsite",
      ogImage: "/images/og-industrial-power.png"
    },
    create: {
      id: "default",
      siteName: process.env.SITE_NAME || "OpenWebsite",
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000",
      defaultLocale: process.env.DEFAULT_LOCALE || "zh",
      supportedLocales: process.env.SUPPORTED_LOCALES || "zh,en",
      seoTitle: process.env.SITE_SEO_TITLE || "OpenWebsite | SEO-first company website system",
      seoDescription:
        process.env.SITE_DESCRIPTION ||
        "An SEO-first open-source company website system powered by Next.js.",
      seoKeywords: process.env.SITE_KEYWORDS || "company website, SEO, Next.js, OpenWebsite",
      ogImage: "/images/og-industrial-power.png"
    }
  });

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN"
    },
    create: {
      email: adminEmail,
      passwordHash: hashPassword(adminPassword),
      role: "ADMIN"
    }
  });

  const power = await prisma.category.upsert({
    where: { slug: "industrial-power" },
    update: { sortOrder: 10 },
    create: { slug: "industrial-power", sortOrder: 10 }
  });

  const service = await prisma.category.upsert({
    where: { slug: "service-and-projects" },
    update: { sortOrder: 20 },
    create: { slug: "service-and-projects", sortOrder: 20 }
  });

  await upsertCategoryTranslation(power.id, "zh", "工业电力", "柴油、燃气与混合能源解决方案。");
  await upsertCategoryTranslation(power.id, "en", "Industrial Power", "Diesel, gas and hybrid power solutions.");
  await upsertCategoryTranslation(service.id, "zh", "服务与案例", "项目交付、维保与工程支持。");
  await upsertCategoryTranslation(service.id, "en", "Service & Projects", "Delivery, maintenance and engineering support.");

  await upsertScheduledTask({
    taskKey: "sitemap-refresh",
    name: "站点地图刷新",
    schedule: "每小时",
    description: "触发公开内容页面重新验证，确保 sitemap 和文章列表及时更新。",
    nextRunAt: new Date(Date.now() + 60 * 60 * 1000)
  });
  await upsertScheduledTask({
    taskKey: "seo-audit",
    name: "SEO 诊断扫描",
    schedule: "每天 03:00",
    description: "扫描公开页面、文章和分类的 SEO 完整度。",
    nextRunAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });
  await upsertScheduledTask({
    taskKey: "contact-maintenance",
    name: "线索数据巡检",
    schedule: "每天 04:00",
    description: "统计未读联系记录，并为后台概览提供状态数据。",
    nextRunAt: new Date(Date.now() + 25 * 60 * 60 * 1000)
  });

  await upsertArticle({
    slug: "diesel-generator-selection-guide",
    categoryId: power.id,
    coverImage: "/images/article-generator-room.png",
    publishedAt: new Date("2026-01-12T08:00:00.000Z"),
    translations: {
      zh: {
        title: "工业企业如何选择柴油发电机组",
        summary: "从功率、负载、冗余、噪音和运维角度，快速建立企业备用电源选型框架。",
        content: `## 先明确负载类型

工业备用电源的核心不是简单放大功率，而是理解负载启动电流、连续运行时长和允许切换时间。数据中心、矿山、制造车间和医院对冗余等级的要求完全不同。

## 关注真实运行场景

- 待机应用优先考虑启动可靠性和维护便利性。
- 主用或连续运行项目需要评估燃油经济性、散热、噪音和排放。
- 远程现场应提前规划备件、远程监控和服务响应。

## 建议

在最终采购前，建议提供负载清单、现场海拔、环境温度、燃油条件和并机需求。工程团队可以据此输出更准确的功率段与配置方案。`,
        seoTitle: "柴油发电机组选型指南 | OpenWebsite",
        seoDescription: "面向工业企业的柴油发电机组选型指南，覆盖功率、负载、冗余和运维。",
        seoKeywords: "柴油发电机,备用电源,工业电力"
      },
      en: {
        title: "How industrial teams choose diesel generator sets",
        summary: "A practical framework for sizing standby power across load, redundancy, noise and service needs.",
        content: `## Start with the load profile

Reliable standby power is not only about oversizing capacity. Teams need to understand starting current, runtime, transfer time and redundancy requirements.

## Match the operating mode

- Standby systems emphasize reliable start and easy maintenance.
- Prime and continuous projects need fuel efficiency, cooling, noise and emissions planning.
- Remote sites should plan spare parts, monitoring and service access early.

## Recommendation

Before procurement, share the load list, altitude, ambient temperature, fuel conditions and paralleling needs. Engineering can then recommend a more accurate capacity range and configuration.`,
        seoTitle: "Diesel Generator Selection Guide | OpenWebsite",
        seoDescription: "A practical diesel generator selection guide for industrial companies.",
        seoKeywords: "diesel generator, standby power, industrial power"
      }
    }
  });

  await upsertArticle({
    slug: "gas-power-station-project-readiness",
    categoryId: service.id,
    coverImage: "/images/article-gas-station.png",
    publishedAt: new Date("2026-02-20T08:00:00.000Z"),
    translations: {
      zh: {
        title: "燃气电站项目启动前需要准备什么",
        summary: "燃气品质、并网要求、现场土建与长期运维，是连续电力项目能否稳定落地的关键。",
        content: `## 燃气条件决定系统边界

燃气发电项目首先要确认气源稳定性、热值范围、压力、硫含量和净化条件。这些参数会直接影响发动机选型和维护策略。

## 项目准备清单

- 气源检测报告和供气曲线
- 并网或孤网运行要求
- 现场平面、散热和噪音边界
- 长期备件与服务计划

## 交付建议

越早让设备工程、土建、电气和运维团队协同，越能减少后期返工。`,
        seoTitle: "燃气电站项目准备清单 | OpenWebsite",
        seoDescription: "燃气电站项目启动前的气源、并网、土建与运维准备清单。",
        seoKeywords: "燃气发电,电站项目,连续电力"
      },
      en: {
        title: "What to prepare before a gas power station project",
        summary: "Gas quality, grid requirements, civil works and service planning determine project readiness.",
        content: `## Gas conditions define the system

Gas power projects start with stable supply, heating value, pressure, sulfur content and treatment conditions. These inputs shape engine selection and maintenance strategy.

## Project checklist

- Gas test reports and supply curve
- Grid-connected or island-mode requirements
- Site layout, cooling and noise limits
- Long-term spare parts and service plan

## Delivery advice

Bring equipment, civil, electrical and operations teams together early to reduce late-stage rework.`,
        seoTitle: "Gas Power Station Readiness Checklist | OpenWebsite",
        seoDescription: "Gas power station readiness checklist covering gas, grid, civil and service planning.",
        seoKeywords: "gas power, power station, continuous power"
      }
    }
  });

  await prisma.contactSubmission.upsert({
    where: { id: "seed-contact-submission" },
    update: {},
    create: {
      id: "seed-contact-submission",
      name: "Demo Buyer",
      email: "buyer@example.com",
      phone: "+86 138 0000 0000",
      message: "We need a 800 kVA standby solution for a factory expansion.",
      sourcePage: "/zh/contact"
    }
  });
}

async function upsertCategoryTranslation(
  categoryId: string,
  locale: string,
  name: string,
  description: string
) {
  await prisma.categoryTranslation.upsert({
    where: { categoryId_locale: { categoryId, locale } },
    update: { name, description },
    create: { categoryId, locale, name, description }
  });
}

async function upsertScheduledTask(input: {
  taskKey: string;
  name: string;
  schedule: string;
  description: string;
  nextRunAt: Date;
}) {
  await prisma.scheduledTask.upsert({
    where: { taskKey: input.taskKey },
    update: {
      name: input.name,
      schedule: input.schedule,
      description: input.description,
      nextRunAt: input.nextRunAt
    },
    create: {
      taskKey: input.taskKey,
      name: input.name,
      schedule: input.schedule,
      description: input.description,
      nextRunAt: input.nextRunAt
    }
  });
}

async function upsertArticle(input: {
  slug: string;
  categoryId: string;
  coverImage: string;
  publishedAt: Date;
  translations: Record<
    string,
    {
      title: string;
      summary: string;
      content: string;
      seoTitle: string;
      seoDescription: string;
      seoKeywords: string;
    }
  >;
}) {
  const article = await prisma.article.upsert({
    where: { slug: input.slug },
    update: {
      categoryId: input.categoryId,
      coverImage: input.coverImage,
      status: "PUBLISHED",
      publishedAt: input.publishedAt
    },
    create: {
      slug: input.slug,
      categoryId: input.categoryId,
      coverImage: input.coverImage,
      status: "PUBLISHED",
      publishedAt: input.publishedAt
    }
  });

  for (const [locale, translation] of Object.entries(input.translations)) {
    await prisma.articleTranslation.upsert({
      where: { articleId_locale: { articleId: article.id, locale } },
      update: translation,
      create: { articleId: article.id, locale, ...translation }
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
