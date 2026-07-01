import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { serializeSiteSettings, upsertSiteSettingsFromJson } from "@/lib/ai-ops-content";
import { prisma } from "@/lib/db";
import { revalidatePublicContent } from "@/lib/revalidate";
import { SITE_SETTINGS_ID } from "@/lib/settings";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const settings = await prisma.siteSetting.findUnique({ where: { id: SITE_SETTINGS_ID } });
  return NextResponse.json({ data: serializeSiteSettings(settings) });
}

export async function PATCH(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  try {
    const current = await prisma.siteSetting.findUnique({ where: { id: SITE_SETTINGS_ID } });
    const payload = {
      ...serializeSiteSettings(current),
      ...((await request.json()) as Record<string, unknown>)
    };
    const settings = await upsertSiteSettingsFromJson(payload);
    revalidatePublicContent();
    return NextResponse.json({ data: serializeSiteSettings(settings) });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid site settings payload",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
