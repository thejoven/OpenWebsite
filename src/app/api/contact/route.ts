import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifyContactSubmission } from "@/lib/mailer";
import { checkRateLimit } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validators";

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(`contact:${ip}`, 8, 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const submission = await prisma.contactSubmission.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message,
      sourcePage: parsed.data.sourcePage || null
    }
  });

  await notifyContactSubmission(submission).catch((error) => {
    console.error("Failed to send contact notification", error);
  });

  return NextResponse.json({ ok: true, id: submission.id });
}
