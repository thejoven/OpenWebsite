"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { revalidatePublicContent } from "@/lib/revalidate";
import { runSeoAutoFix } from "@/lib/seo-auto-fix";

export async function fixSeoIssuesAction() {
  await requireAdmin();

  let target = "/admin/system/seo?error=ai-fix";

  try {
    const result = await runSeoAutoFix();
    revalidatePublicContent();
    target =
      `/admin/system/seo?fixed=1` +
      `&before=${result.averageScoreBefore}` +
      `&after=${result.averageScoreAfter}` +
      `&issuesBefore=${result.totalIssuesBefore}` +
      `&issuesAfter=${result.totalIssuesAfter}` +
      `&fields=${result.changedFields}` +
      `&targets=${result.fixedTargets}`;
  } catch (error) {
    console.error("SEO auto fix failed:", error);
    target =
      error instanceof Error && error.message.includes("AI configuration")
        ? "/admin/system/seo?error=ai-config"
        : "/admin/system/seo?error=ai-fix";
  }

  redirect(target);
}
