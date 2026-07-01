import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { aiOpsDownloads, aiOpsEndpoints } from "@/lib/ai-ops-links";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const settings = await getSiteSettings();
  const [articleCount, categoryCount, mediaCount] = await Promise.all([
    prisma.article.count(),
    prisma.category.count(),
    prisma.mediaAsset.count()
  ]);

  return NextResponse.json({
    product: "OpenWebsite",
    positioning:
      "AI-native website foundation for multilingual content, article SEO, category SEO, and template-independent frontend integration.",
    actor,
    settings,
    counts: {
      articles: articleCount,
      categories: categoryCount,
      media: mediaCount
    },
    routePatterns: {
      home: "/:locale",
      articles: "/:locale/articles",
      articleDetail: "/:locale/articles/:slug",
      categoryFilter: "/:locale/articles?category=:slug",
      sitemap: "/sitemap.xml",
      robots: "/robots.txt"
    },
    endpoints: aiOpsEndpoints,
    docs: {
      markdownFile: "/docs/AI_OPERATIONS.md",
      markdownEndpoint: "/api/ai/docs",
      markdownDownload: aiOpsDownloads.markdown,
      skill: "/skills/openwebsite-ai-ops/SKILL.md",
      skillPackage: aiOpsDownloads.skillPackage
    }
  });
}
