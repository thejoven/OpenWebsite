import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { prisma } from "@/lib/db";
import { serializeMediaAsset, storeImageFile } from "@/lib/media-upload";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const { searchParams } = new URL(request.url);
  const take = Math.min(Number(searchParams.get("limit") || 50), 200);
  const media = await prisma.mediaAsset.findMany({
    orderBy: [{ createdAt: "desc" }],
    take
  });

  return NextResponse.json({ data: media.map(serializeMediaAsset) });
}

export async function POST(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File field is required." }, { status: 400 });
    }

    const asset = await storeImageFile(file, actor.id);
    return NextResponse.json({ data: serializeMediaAsset(asset) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Upload failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
