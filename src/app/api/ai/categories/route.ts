import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { serializeCategory, upsertCategoryFromJson } from "@/lib/ai-ops-content";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const categories = await prisma.category.findMany({
    include: { translations: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ data: categories.map(serializeCategory) });
}

export async function POST(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  try {
    const payload = await request.json();
    const category = await upsertCategoryFromJson(payload);
    revalidatePublicContent();
    return NextResponse.json({ data: serializeCategory(category) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid category payload",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
