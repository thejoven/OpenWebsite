"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function markContactReadAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/admin/contacts?error=missing");
  }

  await prisma.contactSubmission.update({
    where: { id },
    data: { isRead: true }
  });
  redirect("/admin/contacts?updated=1");
}

export async function deleteContactAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") || "");
  if (!id) {
    redirect("/admin/contacts?error=missing");
  }

  await prisma.contactSubmission.delete({ where: { id } });
  redirect("/admin/contacts?deleted=1");
}
