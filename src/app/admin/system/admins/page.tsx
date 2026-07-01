import { ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  formatDateTime,
  SystemHeader,
  SystemNotice
} from "@/components/admin/system/system-common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { deleteAdminUserAction, saveAdminUserAction } from "../actions";

export default async function SystemAdminsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const [query, admins] = await Promise.all([
    searchParams,
    prisma.user.findMany({ orderBy: [{ createdAt: "asc" }] })
  ]);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="创建管理员、更新登录邮箱，以及按需重置后台密码。"
        title="系统管理 / 管理员"
      />
      <SystemNotice error={query.error} saved={query.saved} />

      <Card className="mt-8">
        <CardContent>
          <h2 className="admin-section-title">
            <ShieldCheck aria-hidden className="h-5 w-5" />
            后台管理员
          </h2>
          <form
            action={saveAdminUserAction}
            className="mt-5 grid gap-4 rounded-[8px] bg-[#1f1f1f] p-4 shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]"
          >
            <h3 className="flex items-center gap-2 font-bold text-white">
              <UserPlus
                aria-hidden
                className="h-4 w-4 text-[var(--admin-green)]"
              />
              新增管理员
            </h3>
            <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <label>
                <span className="admin-label">邮箱账号</span>
                <input
                  className="admin-field"
                  name="email"
                  required
                  type="email"
                />
              </label>
              <label>
                <span className="admin-label">初始密码</span>
                <input
                  className="admin-field"
                  minLength={8}
                  name="password"
                  required
                  type="password"
                />
              </label>
              <Button className="self-end" type="submit">
                创建
              </Button>
            </div>
          </form>

          <div className="mt-5 grid gap-4">
            {admins.map((admin) => (
              <div
                className="rounded-[8px] bg-[#1f1f1f] p-4 shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]"
                key={admin.id}
              >
                <form
                  action={saveAdminUserAction}
                  className="grid gap-4 md:grid-cols-[1fr_1fr_auto]"
                >
                  <input name="id" type="hidden" value={admin.id} />
                  <label>
                    <span className="admin-label">邮箱账号</span>
                    <input
                      className="admin-field"
                      defaultValue={admin.email}
                      name="email"
                      required
                      type="email"
                    />
                  </label>
                  <label>
                    <span className="admin-label">新密码</span>
                    <input
                      className="admin-field"
                      minLength={8}
                      name="password"
                      type="password"
                    />
                  </label>
                  <Button
                    className="self-end"
                    label={false}
                    type="submit"
                    variant="secondary"
                  >
                    保存
                  </Button>
                </form>
                <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[var(--admin-muted)]">
                  <span>创建于 {formatDateTime(admin.createdAt)}</span>
                  {admin.id !== session.userId ? (
                    <form action={deleteAdminUserAction}>
                      <input name="id" type="hidden" value={admin.id} />
                      <Button label={false} type="submit" variant="destructive">
                        <Trash2 aria-hidden className="h-4 w-4" />
                        删除
                      </Button>
                    </form>
                  ) : (
                    <Badge variant="success">当前登录</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
