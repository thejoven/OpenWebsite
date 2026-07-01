import Link from "next/link";
import {
  Bot,
  Clock3,
  FileText,
  FolderTree,
  ImageIcon,
  Inbox,
  Plus
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ensureScheduledTasks } from "@/lib/system-tasks";

export default async function AdminDashboardPage() {
  const session = await requireAdmin();
  await ensureScheduledTasks();
  const [categories, articles, contacts, unreadContacts, tasks, media] =
    await prisma.$transaction([
      prisma.category.count(),
      prisma.article.count(),
      prisma.contactSubmission.count(),
      prisma.contactSubmission.count({ where: { isRead: false } }),
      prisma.scheduledTask.count(),
      prisma.mediaAsset.count()
    ]);

  const stats = [
    {
      label: "分类",
      value: categories,
      icon: FolderTree,
      href: "/admin/categories"
    },
    { label: "文章", value: articles, icon: FileText, href: "/admin/articles" },
    {
      label: "联系记录",
      value: contacts,
      icon: Inbox,
      href: "/admin/contacts"
    },
    {
      label: "未读线索",
      value: unreadContacts,
      icon: Inbox,
      href: "/admin/contacts"
    },
    {
      label: "定时任务",
      value: tasks,
      icon: Clock3,
      href: "/admin/system/tasks"
    },
    {
      label: "上传图片",
      value: media,
      icon: ImageIcon,
      href: "/admin/system/media"
    },
    { label: "AI 运维", value: 8, icon: Bot, href: "/admin/ai-ops" }
  ];

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">后台概览</h1>
          <p className="admin-page-description">
            管理文章、分类、多语言内容和联系表单记录。
          </p>
        </div>
        <Link
          className="focus-ring admin-button admin-button-primary"
          href="/admin/articles/new"
        >
          <Plus aria-hidden className="h-4 w-4" />
          新建文章
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              className="focus-ring admin-card admin-card-bordered group p-5 transition hover:bg-[#1f1f1f]"
              href={stat.href}
              key={stat.label}
            >
              <span className="grid h-11 w-11 place-items-center rounded-full bg-[#1f1f1f] text-[var(--admin-green)] transition group-hover:bg-[var(--admin-green)] group-hover:text-black">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <p className="mt-5 text-3xl font-bold text-white">{stat.value}</p>
              <p className="mt-1 text-sm font-bold text-[var(--admin-muted)]">
                {stat.label}
              </p>
            </Link>
          );
        })}
      </div>
    </AdminShell>
  );
}
