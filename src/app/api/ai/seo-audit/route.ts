import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { revalidatePublicContent } from "@/lib/revalidate";
import { runSeoAutoFix } from "@/lib/seo-auto-fix";
import { runSeoDoctor } from "@/lib/seo-doctor";
import { getSiteSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const settings = await getSiteSettings();
  const audit = await runSeoDoctor(settings);

  return NextResponse.json({ data: audit });
}

export async function POST(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  try {
    const result = await runSeoAutoFix();
    revalidatePublicContent();
    return NextResponse.json({ data: result });
  } catch (error) {
    return NextResponse.json(
      {
        error: "SEO auto fix failed",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 400 }
    );
  }
}
