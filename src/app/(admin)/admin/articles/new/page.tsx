import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { AdminShell } from "@/components/admin/admin-shell";
import { ArticleEditor } from "@/components/admin/article-editor";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export default async function NewArticlePage() {
  const session = await requireAdmin();
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      include: { translations: true },
      orderBy: [{ sortOrder: "asc" }]
    })
  ]);

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header mb-8">
        <div>
          <h1 className="admin-page-title">新建文章</h1>
          <p className="admin-page-description">
            填写默认语言标题后即可保存草稿或发布。
          </p>
        </div>
        <Button asChild label={false} variant="secondary">
          <Link href="/admin/articles">
            <ArrowLeft aria-hidden className="h-4 w-4" />
            返回列表
          </Link>
        </Button>
      </div>
      <ArticleEditor
        article={null}
        categories={categories}
        defaultLocale={settings.defaultLocale}
        locales={settings.supportedLocales}
      />
    </AdminShell>
  );
}
