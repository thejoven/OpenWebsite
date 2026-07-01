import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

function csvCell(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  await requireAdmin();
  const submissions = await prisma.contactSubmission.findMany({
    orderBy: { createdAt: "desc" }
  });

  const header = ["id", "name", "email", "phone", "message", "sourcePage", "isRead", "createdAt"];
  const rows = submissions.map((submission) =>
    [
      submission.id,
      submission.name,
      submission.email,
      submission.phone,
      submission.message,
      submission.sourcePage,
      submission.isRead,
      submission.createdAt.toISOString()
    ]
      .map(csvCell)
      .join(",")
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="contact-submissions.csv"`
    }
  });
}
