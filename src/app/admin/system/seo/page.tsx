import { Activity, Globe2, SearchCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  scoreColor,
  SystemHeader
} from "@/components/admin/system/system-common";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { requireAdmin } from "@/lib/auth";
import { runSeoDoctor } from "@/lib/seo-doctor";
import { getSiteSettings } from "@/lib/settings";

export default async function SystemSeoPage() {
  const session = await requireAdmin();
  const settings = await getSiteSettings();
  const seoAudit = await runSeoDoctor(settings);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="扫描公开页面、文章和分类的 SEO 完整度，并列出待修复项。"
        title="系统管理 / SEO 医生"
      />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
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
                          <p className="font-bold">
                            {issue.severity}: {issue.message}
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
