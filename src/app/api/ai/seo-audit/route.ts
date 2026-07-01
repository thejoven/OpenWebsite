import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";
import { runSeoDoctor } from "@/lib/seo-doctor";
import { getSiteSettings } from "@/lib/settings";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const settings = await getSiteSettings();
  const audit = await runSeoDoctor(settings);

  return NextResponse.json({ data: audit });
}
