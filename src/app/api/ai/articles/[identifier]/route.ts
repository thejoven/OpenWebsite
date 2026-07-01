import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { serializeArticle, upsertArticleFromJson } from "@/lib/ai-ops-content";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";

async function findArticle(identifier: string) {
  return prisma.article.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }]
    },
    include: {
      translations: true,
      category: { include: { translations: true } }
    }
  });
}

export async function GET(request: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const { identifier } = await params;
  const article = await findArticle(identifier);
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  return NextResponse.json({ data: serializeArticle(article) });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const { identifier } = await params;
  const current = await findArticle(identifier);
  if (!current) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const article = await upsertArticleFromJson({
      ...payload,
      id: current.id,
      slug: payload.slug || current.slug,
      categoryId: payload.categoryId || (payload.categorySlug ? "" : current.categoryId || ""),
      coverImage: payload.coverImage ?? current.coverImage ?? "",
      status: payload.status || current.status,
      publishedAt: payload.publishedAt || current.publishedAt?.toISOString() || ""
    });
    revalidatePublicContent(article.slug);
    if (current.slug !== article.slug) {
      revalidatePublicContent(current.slug);
    }
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

export async function DELETE(request: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const { identifier } = await params;
  const current = await findArticle(identifier);
  if (!current) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  await prisma.article.delete({ where: { id: current.id } });
  revalidatePublicContent(current.slug);

  return NextResponse.json({ data: { deleted: true, id: current.id, slug: current.slug } });
}
