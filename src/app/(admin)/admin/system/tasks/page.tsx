import { Clock3, RefreshCw } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  formatDateTime,
  SystemHeader,
  SystemNotice
} from "@/components/admin/system/system-common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SITEMAP_REFRESH_TASK_KEY } from "@/lib/sitemap";
import { ensureScheduledTasks } from "@/lib/system-tasks";
import { refreshSitemapTaskAction, saveScheduledTaskAction } from "../actions";

export default async function SystemTasksPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  await ensureScheduledTasks();
  const [query, tasks] = await Promise.all([
    searchParams,
    prisma.scheduledTask.findMany({ orderBy: [{ taskKey: "asc" }] })
  ]);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="维护后台计划任务名称、周期、启停状态和说明。"
        title="系统管理 / 定时任务"
      />
      <SystemNotice error={query.error} saved={query.saved} />

      <Card className="mt-8">
        <CardContent>
          <h2 className="admin-section-title">
            <Clock3 aria-hidden className="h-5 w-5" />
            定时任务
          </h2>
          <div className="mt-5 grid gap-4">
            {tasks.map((task) => (
              <form
                action={saveScheduledTaskAction}
                className="rounded-[8px] bg-[#1f1f1f] p-4 shadow-[rgb(77,77,77)_0px_0px_0px_1px_inset]"
                key={task.id}
              >
                <input name="id" type="hidden" value={task.id} />
                <input name="returnTo" type="hidden" value="tasks" />
                <div className="grid gap-4 lg:grid-cols-[1fr_180px_150px]">
                  <label>
                    <span className="admin-label">任务名称</span>
                    <input
                      className="admin-field"
                      defaultValue={task.name}
                      name="name"
                      required
                    />
                  </label>
                  <label>
                    <span className="admin-label">周期</span>
                    <input
                      className="admin-field"
                      defaultValue={task.schedule}
                      name="schedule"
                      required
                    />
                  </label>
                  <label>
                    <span className="admin-label">状态</span>
                    <select
                      className="admin-field"
                      defaultValue={task.status}
                      name="status"
                    >
                      <option value="ACTIVE">启用</option>
                      <option value="PAUSED">暂停</option>
                    </select>
                  </label>
                </div>
                <label className="mt-4 block">
                  <span className="admin-label">说明</span>
                  <textarea
                    className="admin-field min-h-20 resize-y"
                    defaultValue={task.description || ""}
                    name="description"
                  />
                </label>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[var(--admin-muted)]">
                  <span>
                    Key: <strong>{task.taskKey}</strong> · 上次运行{" "}
                    {formatDateTime(task.lastRunAt)} · 下次运行{" "}
                    {formatDateTime(task.nextRunAt)}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    {task.taskKey === SITEMAP_REFRESH_TASK_KEY ? (
                      <Button
                        formAction={refreshSitemapTaskAction}
                        label={false}
                        type="submit"
                      >
                        <RefreshCw aria-hidden className="h-4 w-4" />
                        立即刷新
                      </Button>
                    ) : null}
                    <Button label={false} type="submit" variant="secondary">
                      保存任务
                    </Button>
                  </div>
                </div>
                {task.lastResult ? (
                  <p className="mt-3 break-all text-xs text-[var(--admin-muted)]">
                    上次结果：{task.lastResult}
                  </p>
                ) : null}
              </form>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
