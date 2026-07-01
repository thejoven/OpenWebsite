import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { serializeArticle, upsertArticleFromJson } from "@/lib/ai-ops-content";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const categorySlug = searchParams.get("category");

  const articles = await prisma.article.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(categorySlug ? { category: { slug: categorySlug } } : {})
    },
    include: {
      translations: true,
      category: { include: { translations: true } }
    },
    orderBy: [{ updatedAt: "desc" }]
  });

  return NextResponse.json({ data: articles.map(serializeArticle) });
}

export async function POST(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  try {
    const payload = await request.json();
    const article = await upsertArticleFromJson(payload);
    revalidatePublicContent(article.slug);
    return NextResponse.json({ data: serializeArticle(article) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid article payload",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
