import { Activity, Bot, Globe2, SearchCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  scoreColor,
  SystemHeader
} from "@/components/admin/system/system-common";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getAiConfiguration } from "@/lib/ai-configuration";
import { requireAdmin } from "@/lib/auth";
import { runSeoDoctor } from "@/lib/seo-doctor";
import { getSiteSettings } from "@/lib/settings";
import { fixSeoIssuesAction } from "./actions";

export default async function SystemSeoPage({
  searchParams
}: {
  searchParams: Promise<{
    fixed?: string;
    error?: string;
    before?: string;
    after?: string;
    issuesBefore?: string;
    issuesAfter?: string;
    fields?: string;
    targets?: string;
  }>;
}) {
  const session = await requireAdmin();
  const [query, settings, aiConfig] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getAiConfiguration()
  ]);
  const seoAudit = await runSeoDoctor(settings);
  const canAutoFix =
    aiConfig.enabled && aiConfig.hasApiKey && Boolean(aiConfig.model);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        actions={
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild label={false} variant="secondary">
              <Link href="/admin/system/ai">
                <Bot aria-hidden className="h-4 w-4" />
                AI 配置
              </Link>
            </Button>
            <form action={fixSeoIssuesAction}>
              <Button
                disabled={!canAutoFix || seoAudit.totalFixableIssues === 0}
                label={false}
                type="submit"
              >
                <Sparkles aria-hidden className="h-4 w-4" />
                一键矫正
              </Button>
            </form>
          </div>
        }
        description="扫描公开页面、文章和分类的 SEO 完整度，并列出待修复项。"
        title="系统管理 / SEO 医生"
      />

      {query.fixed ? (
        <Alert className="mt-5" variant="success">
          已完成 AI 矫正：健康分 {query.before || "-"} → {query.after || "-"}，
          问题数 {query.issuesBefore || "-"} → {query.issuesAfter || "-"}， 更新{" "}
          {query.targets || "0"} 个对象 / {query.fields || "0"} 个字段。
        </Alert>
      ) : null}
      {query.error ? (
        <Alert className="mt-5" variant="destructive">
          {query.error === "ai-config"
            ? "请先完成 AI 配置并启用自动矫正。"
            : "AI 矫正失败，请检查模型、Base URL 或 API Key。"}
        </Alert>
      ) : null}

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent>
            <Activity
              aria-hidden
              className="h-5 w-5 text-[var(--admin-green)]"
            />
            <p
              className={`mt-3 text-3xl font-bold ${scoreColor(seoAudit.averageScore)}`}
            >
              {seoAudit.averageScore}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              平均健康分
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Globe2 aria-hidden className="h-5 w-5 text-[var(--admin-green)]" />
            <p className="mt-3 text-3xl font-bold text-white">
              {seoAudit.totalPages}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              诊断页面
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <SearchCheck
              aria-hidden
              className="h-5 w-5 text-[var(--admin-green)]"
            />
            <p className="mt-3 text-3xl font-bold text-white">
              {seoAudit.totalIssues}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              待优化项
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Sparkles
              aria-hidden
              className="h-5 w-5 text-[var(--admin-green)]"
            />
            <p className="mt-3 text-3xl font-bold text-white">
              {seoAudit.totalFixableIssues}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              可矫正项
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>页面</TableHead>
              <TableHead>类型</TableHead>
              <TableHead>分数</TableHead>
              <TableHead>问题</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {seoAudit.audits.slice(0, 40).map((audit) => (
              <TableRow key={audit.url}>
                <TableCell>
                  <p className="font-bold text-white">{audit.title}</p>
                  <p className="mt-1 break-all text-xs text-[var(--admin-muted)]">
                    {audit.url}
                  </p>
                </TableCell>
                <TableCell>{audit.type}</TableCell>
                <TableCell
                  className={`text-lg font-bold ${scoreColor(audit.score)}`}
                >
                  {audit.score}
                </TableCell>
                <TableCell>
                  {audit.issues.length ? (
                    <div className="grid gap-2">
                      {audit.issues.map((issue) => (
                        <div key={`${audit.url}-${issue.message}`}>
                          <p className="flex flex-wrap items-center gap-2 font-bold">
                            <span>
                              {issue.severity}: {issue.message}
                            </span>
                            {issue.fixable ? (
                              <Badge variant="success">可自动矫正</Badge>
                            ) : null}
                          </p>
                          <p className="text-xs text-[var(--admin-muted)]">
                            {issue.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="success">暂无问题</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminShell>
  );
}
