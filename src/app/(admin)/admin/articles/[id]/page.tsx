import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export default async function EditArticlePage({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const session = await requireAdmin();
  const { id } = await params;
  const query = await searchParams;
  const [settings, article, categories] = await Promise.all([
    getSiteSettings(),
    prisma.article.findUnique({
      where: { id },
      include: { translations: true }
    }),
    prisma.category.findMany({
      include: { translations: true },
      orderBy: [{ sortOrder: "asc" }]
    })
  ]);

  if (!article) {
    notFound();
  }

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header mb-8">
        <div>
          <h1 className="admin-page-title">编辑文章</h1>
          <p className="admin-page-description">
            保存后会重新验证对应前台页面。
          </p>
          {query.saved ? (
            <p className="admin-alert admin-alert-success mt-4">
              已保存并触发静态页面更新。
            </p>
          ) : null}
        </div>
        <Button asChild label={false} variant="secondary">
          <Link href="/admin/articles">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>
      <ArticleEditor
        article={article}
        categories={categories}
        defaultLocale={settings.defaultLocale}
        locales={settings.supportedLocales}
      />
    </AdminShell>
  );
}
