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
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000",
      defaultLocale: process.env.DEFAULT_LOCALE || "zh",
      supportedLocales: process.env.SUPPORTED_LOCALES || "zh,en",
      seoTitle:
        process.env.SITE_SEO_TITLE ||
        "OpenWebsite | SEO-first company website system",
      seoDescription:
        process.env.SITE_DESCRIPTION ||
        "An SEO-first open-source company website system for multilingual content, metadata, sitemap, and AI operations.",
      seoKeywords:
        process.env.SITE_KEYWORDS ||
        "company website, SEO, Next.js, OpenWebsite",
      ogImage: "/images/og-industrial-power.png"
    },
    create: {
      id: "default",
      siteName: process.env.SITE_NAME || "OpenWebsite",
      siteUrl:
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000",
      defaultLocale: process.env.DEFAULT_LOCALE || "zh",
      supportedLocales: process.env.SUPPORTED_LOCALES || "zh,en",
      seoTitle:
        process.env.SITE_SEO_TITLE ||
        "OpenWebsite | SEO-first company website system",
      seoDescription:
        process.env.SITE_DESCRIPTION ||
        "An SEO-first open-source company website system for multilingual content, metadata, sitemap, and AI operations.",
      seoKeywords:
        process.env.SITE_KEYWORDS ||
        "company website, SEO, Next.js, OpenWebsite",
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

  await upsertCategoryTranslation(power.id, "zh", {
    name: "工业电力",
    description: "柴油、燃气与混合能源解决方案内容，覆盖选型、部署和运维。",
    seoTitle: "工业电力解决方案 | OpenWebsite",
    seoDescription:
      "面向工业企业的柴油发电、燃气发电与混合能源内容，覆盖选型、部署、运维、备用电源规划和项目交付关键问题，帮助团队建立可靠供电方案并规划专题内容。",
    seoKeywords: "工业电力,柴油发电机,燃气发电,备用电源"
  });
  await upsertCategoryTranslation(power.id, "en", {
    name: "Industrial Power",
    description: "Diesel, gas and hybrid power solutions.",
    seoTitle: "Industrial Power Solutions | OpenWebsite",
    seoDescription:
      "Diesel generator, gas power, hybrid energy, standby power, and project planning content for industrial teams.",
    seoKeywords: "industrial power,diesel generator,gas power,standby power"
  });
  await upsertCategoryTranslation(service.id, "zh", {
    name: "服务与案例",
    description: "项目交付、维保与工程支持内容，覆盖交付准备和长期运营。",
    seoTitle: "服务与项目案例 | OpenWebsite",
    seoDescription:
      "围绕项目交付、工程支持、维护保养和现场服务的文章集合，覆盖启动准备、交付协同、长期运营和案例复盘，帮助团队降低后期返工风险并沉淀项目案例内容。",
    seoKeywords: "项目交付,维保服务,工程支持,案例"
  });
  await upsertCategoryTranslation(service.id, "en", {
    name: "Service & Projects",
    description: "Delivery, maintenance and engineering support.",
    seoTitle: "Service and Project Case Studies | OpenWebsite",
    seoDescription:
      "Articles about project delivery, engineering support, maintenance planning, and service operations for reliable sites.",
    seoKeywords: "project delivery,maintenance,engineering support,case studies"
  });

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
        summary:
          "从功率、负载、冗余、噪音和运维角度，快速建立企业备用电源选型框架。",
        content: `## 先明确负载类型

工业备用电源的核心不是简单放大功率，而是理解负载启动电流、连续运行时长和允许切换时间。数据中心、矿山、制造车间和医院对冗余等级的要求完全不同。

## 关注真实运行场景

- 待机应用优先考虑启动可靠性和维护便利性。
- 主用或连续运行项目需要评估燃油经济性、散热、噪音和排放。
- 远程现场应提前规划备件、远程监控和服务响应。

## 现场条件也会改变配置

海拔、环境温度、粉尘、噪音边界、燃油储备和机房通风都会影响机组降容、散热和维护空间。对于需要并机或远程监控的项目，还要提前确认控制系统、通讯协议和备件策略。

## 建议

在最终采购前，建议提供负载清单、现场海拔、环境温度、燃油条件和并机需求。工程团队可以据此输出更准确的功率段与配置方案。`,
        seoTitle: "柴油发电机组选型指南 | OpenWebsite",
        seoDescription:
          "面向工业企业的柴油发电机组选型指南，覆盖功率、负载、冗余、运行时长、现场环境、并机需求、燃油条件和长期运维规划，帮助采购前明确配置边界与服务要求。",
        seoKeywords: "柴油发电机,备用电源,工业电力"
      },
      en: {
        title: "How industrial teams choose diesel generator sets",
        summary:
          "A practical framework for sizing standby power across load, redundancy, noise and service needs.",
        content: `## Start with the load profile

Reliable standby power is not only about oversizing capacity. Teams need to understand starting current, runtime, transfer time and redundancy requirements.

## Match the operating mode

- Standby systems emphasize reliable start and easy maintenance.
- Prime and continuous projects need fuel efficiency, cooling, noise and emissions planning.
- Remote sites should plan spare parts, monitoring and service access early.

## Recommendation

Before procurement, share the load list, altitude, ambient temperature, fuel conditions and paralleling needs. Engineering can then recommend a more accurate capacity range and configuration.`,
        seoTitle: "Diesel Generator Selection Guide | OpenWebsite",
        seoDescription:
          "A practical diesel generator selection guide for industrial companies, covering load sizing, redundancy, runtime, and service planning.",
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
        summary:
          "燃气品质、并网要求、现场土建与长期运维，是连续电力项目能否稳定落地的关键。",
        content: `## 燃气条件决定系统边界

燃气发电项目首先要确认气源稳定性、热值范围、压力、硫含量和净化条件。这些参数会直接影响发动机选型和维护策略。

## 项目准备清单

- 气源检测报告和供气曲线
- 并网或孤网运行要求
- 现场平面、散热和噪音边界
- 长期备件与服务计划

## 协同节奏

项目启动阶段应让业主、燃气供应方、土建、电气和运维团队共享边界条件。越早确认接口、审批、设备布置和试运行计划，越能减少后期返工。

## 运维边界

项目还需要明确巡检周期、备件库存、远程监控、燃气波动应急方案和服务响应时间。这些安排会影响长期可用率，也能帮助合同和交付团队提前划分责任。

## 交付建议

越早让设备工程、土建、电气和运维团队协同，越能减少后期返工。`,
        seoTitle: "燃气电站项目准备清单 | OpenWebsite",
        seoDescription:
          "燃气电站项目启动前的准备清单，覆盖气源条件、并网要求、土建边界、散热噪音、备件计划、团队协同和长期运维安排，帮助项目降低交付返工风险并明确各方责任。",
        seoKeywords: "燃气发电,电站项目,连续电力"
      },
      en: {
        title: "What to prepare before a gas power station project",
        summary:
          "Gas quality, grid requirements, civil works and service planning determine project readiness.",
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
        seoDescription:
          "Gas power station readiness checklist covering gas, grid, civil and service planning.",
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
  translation: {
    name: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
  }
) {
  await prisma.categoryTranslation.upsert({
    where: { categoryId_locale: { categoryId, locale } },
    update: translation,
    create: { categoryId, locale, ...translation }
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
