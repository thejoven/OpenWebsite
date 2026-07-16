import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { deleteArticleAction } from "./actions";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";

export default async function ArticlesAdminPage({
  searchParams
}: {
  searchParams: Promise<{ deleted?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const [settings, articles] = await Promise.all([
    getSiteSettings(),
    prisma.article.findMany({
      include: {
        translations: true,
        category: { include: { translations: true } }
      },
      orderBy: [{ updatedAt: "desc" }]
    })
  ]);

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">文章管理</h1>
          <p className="admin-page-description">
            创建、编辑、发布多语言文章内容。
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

      {query.deleted || query.error ? (
        <p
          className={`admin-alert mt-5 ${query.error ? "admin-alert-danger" : "admin-alert-success"}`}
        >
          {query.error ? "操作失败。" : "文章已删除。"}
        </p>
      ) : null}

      <div className="admin-card admin-card-bordered mt-8 overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>标题</th>
              <th>Slug</th>
              <th>分类</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article) => {
              const translation =
                article.translations.find(
                  (item) => item.locale === settings.defaultLocale
                ) || article.translations[0];
              const categoryTranslation =
                article.category?.translations.find(
                  (item) => item.locale === settings.defaultLocale
                ) || article.category?.translations[0];
              return (
                <tr key={article.id}>
                  <td className="font-bold text-white">
                    {translation?.title || article.slug}
                  </td>
                  <td className="text-[var(--admin-muted)]">{article.slug}</td>
                  <td>{categoryTranslation?.name || "-"}</td>
                  <td>
                    <span
                      className={`admin-badge ${
                        article.status === "PUBLISHED"
                          ? "admin-badge-success"
                          : "admin-badge-warning"
                      }`}
                    >
                      {article.status === "PUBLISHED" ? "已发布" : "草稿"}
                    </span>
                  </td>
                  <td>
                    {new Intl.DateTimeFormat("zh").format(article.updatedAt)}
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        className="focus-ring admin-button admin-button-secondary"
                        href={`/admin/articles/${article.id}`}
                      >
                        编辑
                      </Link>
                      <form action={deleteArticleAction}>
                        <input name="id" type="hidden" value={article.id} />
                        <input name="slug" type="hidden" value={article.slug} />
                        <button className="focus-ring admin-button admin-button-danger">
                          <Trash2 aria-hidden className="h-4 w-4" />
                          删除
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
