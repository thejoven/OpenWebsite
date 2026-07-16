import type { ComponentType } from "react";
import {
  FolderTree,
  Languages,
  ListOrdered,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getSiteSettings } from "@/lib/settings";
import { deleteCategoryAction, saveCategoryAction } from "./actions";

type CategoryFormData = {
  id: string;
  slug: string;
  sortOrder: number;
  translations: {
    locale: string;
    name: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoKeywords: string | null;
  }[];
};

export default async function CategoriesPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; deleted?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    prisma.category.findMany({
      include: { translations: true, _count: { select: { articles: true } } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }]
    })
  ]);
  const totalArticles = categories.reduce(
    (sum, category) => sum + category._count.articles,
    0
  );

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">分类管理</h1>
          <p className="admin-page-description">
            分类 slug 用于前台筛选 URL，名称和描述按语言独立维护。
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <StatCard
          icon={FolderTree}
          label="分类总数"
          value={String(categories.length)}
        />
        <StatCard
          icon={ListOrdered}
          label="文章绑定"
          value={String(totalArticles)}
        />
        <StatCard
          icon={Languages}
          label="支持语言"
          value={String(settings.supportedLocales.length)}
        />
      </div>

      {query.saved || query.deleted || query.error ? (
        <p
          className={`admin-alert mt-5 ${query.error ? "admin-alert-danger" : "admin-alert-success"}`}
        >
          {query.error
            ? "保存失败，请检查 slug 格式或唯一性。"
            : "操作已完成。"}
        </p>
      ) : null}

      <section className="mt-8">
        <Card className="admin-card-bordered">
          <CardContent>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="admin-section-title">
                  <Plus aria-hidden className="h-5 w-5" />
                  新建分类
                </h2>
                <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
                  Slug、排序和多语言展示内容
                </p>
              </div>
              <Badge variant="success" className="uppercase">
                默认 {settings.defaultLocale}
              </Badge>
            </div>
            <CategoryForm
              defaultLocale={settings.defaultLocale}
              locales={settings.supportedLocales}
              submitLabel="创建分类"
            />
          </CardContent>
        </Card>
      </section>

      <section className="mt-8 grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="admin-section-title">已建分类</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              按排序值升序展示
            </p>
          </div>
          <Badge variant="default">{categories.length} 个分类</Badge>
        </div>

        {categories.length ? (
          categories.map((category) => {
            const translation =
              category.translations.find(
                (item) => item.locale === settings.defaultLocale
              ) || category.translations[0];

            return (
              <Card className="admin-card-bordered" key={category.id}>
                <CardContent>
                  <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold leading-tight text-white">
                          {translation?.name || category.slug}
                        </h3>
                        <Badge className="font-mono" variant="default">
                          {category.slug}
                        </Badge>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant="info">排序 {category.sortOrder}</Badge>
                        <Badge variant="success">
                          {category._count.articles} 篇文章
                        </Badge>
                        <Badge className="uppercase" variant="default">
                          {category.translations.length} 语言
                        </Badge>
                      </div>
                    </div>
                    <form action={deleteCategoryAction}>
                      <input name="id" type="hidden" value={category.id} />
                      <Button label={false} type="submit" variant="destructive">
                        <Trash2 aria-hidden className="h-4 w-4" />
                        删除
                      </Button>
                    </form>
                  </div>
                  <CategoryForm
                    category={category}
                    defaultLocale={settings.defaultLocale}
                    locales={settings.supportedLocales}
                    submitLabel="保存分类"
                  />
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card className="admin-card-bordered">
            <CardContent className="text-sm text-[var(--admin-muted)]">
              暂无分类。
            </CardContent>
          </Card>
        )}
      </section>
    </AdminShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value
}: {
  icon: ComponentType<{ "aria-hidden"?: boolean; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card className="admin-card-bordered">
      <CardContent className="flex items-center justify-between gap-4 p-4">
        <div>
          <p className="admin-label mb-2">{label}</p>
          <p className="text-2xl font-semibold leading-none text-white">
            {value}
          </p>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-[rgba(30,215,96,0.13)] text-[var(--admin-green)]">
          <Icon aria-hidden className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
  );
}

function CategoryForm({
  category,
  defaultLocale,
  locales,
  submitLabel
}: {
  category?: CategoryFormData;
  defaultLocale: string;
  locales: string[];
  submitLabel: string;
}) {
  const translations = new Map(
    category?.translations.map((translation) => [
      translation.locale,
      translation
    ])
  );
  const formLocales = Array.from(new Set([defaultLocale, ...locales])).filter(
    Boolean
  );

  return (
    <form action={saveCategoryAction} className="mt-5 grid gap-5">
      {category ? <input name="id" type="hidden" value={category.id} /> : null}
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="grid content-start gap-4">
          <label>
            <span className="admin-label">Slug</span>
            <input
              className="admin-field"
              name="slug"
              required
              defaultValue={category?.slug || ""}
            />
          </label>
          <label>
            <span className="admin-label">排序</span>
            <input
              className="admin-field"
              defaultValue={category?.sortOrder || 0}
              min={0}
              name="sortOrder"
              type="number"
            />
          </label>
        </div>

        <Tabs defaultValue={defaultLocale}>
          <TabsList aria-label="分类语言">
            {formLocales.map((locale) => (
              <TabsTrigger className="uppercase" key={locale} value={locale}>
                {locale}
              </TabsTrigger>
            ))}
          </TabsList>

          {formLocales.map((locale) => {
            const translation = translations.get(locale);
            return (
              <TabsContent forceMount key={locale} value={locale}>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="admin-label">名称</span>
                      <input
                        className="admin-field"
                        name={`name_${locale}`}
                        defaultValue={translation?.name || ""}
                        aria-required={locale === defaultLocale}
                      />
                    </label>
                    <label>
                      <span className="admin-label">SEO 标题</span>
                      <input
                        className="admin-field"
                        name={`seoTitle_${locale}`}
                        defaultValue={translation?.seoTitle || ""}
                      />
                    </label>
                  </div>
                  <label>
                    <span className="admin-label">描述</span>
                    <textarea
                      className="admin-field min-h-20 resize-y"
                      name={`description_${locale}`}
                      defaultValue={translation?.description || ""}
                    />
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="admin-label">SEO 描述</span>
                      <textarea
                        className="admin-field min-h-20 resize-y"
                        name={`seoDescription_${locale}`}
                        defaultValue={translation?.seoDescription || ""}
                      />
                    </label>
                    <label>
                      <span className="admin-label">SEO 关键词</span>
                      <textarea
                        className="admin-field min-h-20 resize-y"
                        name={`seoKeywords_${locale}`}
                        defaultValue={translation?.seoKeywords || ""}
                      />
                    </label>
                  </div>
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>

      <Button className="w-fit" label={false} type="submit">
        <Save aria-hidden className="h-4 w-4" />
        {submitLabel}
      </Button>
    </form>
  );
}
