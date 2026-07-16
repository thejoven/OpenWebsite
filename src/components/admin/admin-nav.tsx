"use client";

import Link from "next/link";
import {
  Bot,
  Cpu,
  FileText,
  FolderTree,
  Home,
  ImageIcon,
  Inbox,
  LogOut,
  SearchCheck,
  Settings,
  ShieldCheck,
  Timer
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logoutAction } from "@/app/(admin)/admin/actions";
import { OwLogo } from "@/components/admin/ow-logo";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/admin", label: "概览", icon: Home },
  { href: "/admin/categories", label: "分类", icon: FolderTree },
  { href: "/admin/articles", label: "文章", icon: FileText },
  { href: "/admin/contacts", label: "联系记录", icon: Inbox },
  { href: "/admin/ai-ops", label: "AI 运维", icon: Bot },
  { href: "/admin/system", label: "系统管理", icon: Settings }
];

const systemLinks = [
  { href: "/admin/system", label: "基础配置", icon: Settings },
  { href: "/admin/system/ai", label: "AI 配置", icon: Cpu },
  { href: "/admin/system/admins", label: "管理员", icon: ShieldCheck },
  { href: "/admin/system/tasks", label: "定时任务", icon: Timer },
  { href: "/admin/system/media", label: "媒体库", icon: ImageIcon },
  { href: "/admin/system/seo", label: "SEO 医生", icon: SearchCheck }
];

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const showSystemNav = pathname.startsWith("/admin/system");

  return (
    <aside className="border-b border-white/5 bg-[#121212] lg:sticky lg:top-0 lg:flex lg:h-screen lg:shrink-0 lg:border-b-0 lg:border-r">
      <div className="flex h-full flex-col gap-5 p-3 lg:w-[272px] lg:p-4">
        <div className="px-1">
          <div className="flex items-center gap-3">
            <OwLogo className="h-10 w-10" markClassName="h-7 w-7" />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-white">
                OpenWebsite CMS
              </p>
              <p className="truncate text-xs text-[var(--admin-muted)]">
                {email}
              </p>
            </div>
          </div>
        </div>

        <nav
          className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0"
          aria-label="Admin navigation"
        >
          {links.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-sm transition ${
                  isActive
                    ? "bg-[#1f1f1f] font-bold text-white shadow-[rgba(0,0,0,0.3)_0px_8px_8px]"
                    : "font-bold text-[var(--admin-muted)] hover:bg-[#1f1f1f] hover:text-white"
                }`}
                href={item.href}
                key={item.href}
              >
                <Icon
                  aria-hidden
                  className={`h-4 w-4 ${isActive ? "text-[var(--admin-green)]" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form action={logoutAction} className="mt-auto">
          <Button
            className="justify-start px-3"
            label={false}
            variant="destructive"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            退出登录
          </Button>
        </form>
      </div>
      {showSystemNav ? (
        <div className="border-t border-white/5 p-3 lg:w-56 lg:border-l lg:border-t-0 lg:p-4">
          <div className="mb-4 px-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--admin-muted)]">
              系统目录
            </p>
            <p className="mt-1 text-sm font-bold text-white">管理模块</p>
          </div>
          <nav
            aria-label="System management navigation"
            className="flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0"
          >
            {systemLinks.map((subItem) => {
              const SubIcon = subItem.icon;
              const isSubActive =
                pathname === subItem.href ||
                (subItem.href !== "/admin/system" &&
                  pathname.startsWith(`${subItem.href}/`));

              return (
                <Link
                  aria-current={isSubActive ? "page" : undefined}
                  className={`focus-ring inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2.5 text-sm transition ${
                    isSubActive
                      ? "bg-[#252525] font-bold text-white shadow-[rgba(0,0,0,0.3)_0px_8px_8px]"
                      : "font-bold text-[var(--admin-muted)] hover:bg-[#1f1f1f] hover:text-white"
                  }`}
                  href={subItem.href}
                  key={subItem.href}
                >
                  <SubIcon
                    aria-hidden
                    className={`h-4 w-4 ${isSubActive ? "text-[var(--admin-green)]" : ""}`}
                  />
                  {subItem.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </aside>
  );
}
