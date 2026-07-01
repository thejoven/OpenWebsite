import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSession } from "./auth";

export type AiOpsActor = {
  id: string;
  email: string;
  source: "session" | "token";
};

function safeEqual(a: string, b: string) {
  const actual = Buffer.from(a);
  const expected = Buffer.from(b);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function getAiOpsActor(request: Request): Promise<AiOpsActor | null> {
  const session = await getSession();
  if (session?.role === "ADMIN") {
    return {
      id: session.userId,
      email: session.email,
      source: "session"
    };
  }

  const configuredToken = process.env.AI_OPS_TOKEN || process.env.ADMIN_API_TOKEN || "";
  const header = request.headers.get("authorization") || "";
  const bearerToken = header.match(/^Bearer\s+(.+)$/i)?.[1]?.trim() || "";

  if (configuredToken && bearerToken && safeEqual(bearerToken, configuredToken)) {
    return {
      id: "ai-ops-token",
      email: "ai-ops-token",
      source: "token"
    };
  }

  return null;
}

export async function requireAiOpsActor(request: Request) {
  const actor = await getAiOpsActor(request);
  if (!actor) {
    return {
      actor: null,
      response: NextResponse.json(
        {
          error: "Unauthorized",
          message: "Use an admin session or Authorization: Bearer $AI_OPS_TOKEN."
        },
        { status: 401 }
      )
    };
  }

  return { actor, response: null };
}
