import Link from "next/link";
import { Download, Search, Trash2 } from "lucide-react";
import { deleteContactAction, markContactReadAction } from "./actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ContactsPage({
  searchParams
}: {
  searchParams: Promise<{
    q?: string;
    updated?: string;
    deleted?: string;
    error?: string;
  }>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const q = query.q?.trim();
  const submissions = await prisma.contactSubmission.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { phone: { contains: q } },
            { message: { contains: q } },
            { sourcePage: { contains: q } }
          ]
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">联系记录</h1>
          <p className="admin-page-description">
            查看、检索、导出联系表单提交。
          </p>
        </div>
        <Link
          className="focus-ring admin-button admin-button-primary"
          href="/admin/contacts/export"
        >
          <Download aria-hidden className="h-4 w-4" />
          导出 CSV
        </Link>
      </div>

      <form
        className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row"
        action="/admin/contacts"
      >
        <label className="sr-only" htmlFor="q">
          搜索
        </label>
        <input
          className="admin-field"
          defaultValue={q || ""}
          id="q"
          name="q"
          placeholder="搜索姓名、邮箱、电话、留言或来源"
        />
        <button className="focus-ring admin-button admin-button-secondary">
          <Search aria-hidden className="h-4 w-4" />
          搜索
        </button>
      </form>

      {query.updated || query.deleted || query.error ? (
        <p
          className={`admin-alert mt-5 ${query.error ? "admin-alert-danger" : "admin-alert-success"}`}
        >
          {query.error ? "操作失败。" : "操作已完成。"}
        </p>
      ) : null}

      <div className="admin-card admin-card-bordered mt-8 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>状态</th>
              <th>联系人</th>
              <th>留言</th>
              <th>来源</th>
              <th>时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td>
                  <span
                    className={`admin-badge ${submission.isRead ? "admin-badge-muted" : "admin-badge-success"}`}
                  >
                    {submission.isRead ? "已读" : "未读"}
                  </span>
                </td>
                <td>
                  <div className="font-bold text-white">{submission.name}</div>
                  <div className="text-sm text-[var(--admin-muted)]">
                    {submission.email}
                  </div>
                  <div className="text-sm text-[var(--admin-muted)]">
                    {submission.phone || "-"}
                  </div>
                </td>
                <td className="max-w-xl whitespace-pre-wrap">
                  {submission.message}
                </td>
                <td>{submission.sourcePage || "-"}</td>
                <td>
                  {new Intl.DateTimeFormat("zh", {
                    dateStyle: "short",
                    timeStyle: "short"
                  }).format(submission.createdAt)}
                </td>
                <td>
                  <div className="flex flex-wrap gap-2">
                    {!submission.isRead ? (
                      <form action={markContactReadAction}>
                        <input name="id" type="hidden" value={submission.id} />
                        <button className="focus-ring admin-button admin-button-secondary">
                          标记已读
                        </button>
                      </form>
                    ) : null}
                    <form action={deleteContactAction}>
                      <input name="id" type="hidden" value={submission.id} />
                      <button className="focus-ring admin-button admin-button-danger">
                        <Trash2 aria-hidden className="h-4 w-4" />
                        删除
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
