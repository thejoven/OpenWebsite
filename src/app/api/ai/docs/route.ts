import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { requireAiOpsActor } from "@/lib/ai-ops-auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { actor, response } = await requireAiOpsActor(request);
  if (!actor) return response;

  const markdown = await readFile(path.join(process.cwd(), "docs", "AI_OPERATIONS.md"), "utf8");
  const { searchParams } = new URL(request.url);
  const shouldDownload = searchParams.get("download") === "1";

  return new NextResponse(markdown, {
    headers: {
      ...(shouldDownload
        ? {
            "content-disposition": 'attachment; filename="AI_OPERATIONS.md"'
          }
        : {}),
      "cache-control": "no-store",
      "content-type": "text/markdown; charset=utf-8"
    }
  });
}
