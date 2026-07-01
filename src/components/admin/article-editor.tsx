import type {
  Article,
  ArticleTranslation,
  Category,
  CategoryTranslation
} from "@prisma/client";
import { Globe2, Save } from "lucide-react";
import { saveArticleAction } from "@/app/admin/articles/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageUploadField } from "./image-upload-field";
import { MarkdownEditor } from "./markdown-editor";

type EditorArticle =
  | (Article & {
      translations: ArticleTranslation[];
    })
  | null;

type EditorCategory = Category & {
  translations: CategoryTranslation[];
};

function formatDateTimeLocal(date: Date | null) {
  if (!date) {
    return "";
  }
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function categoryLabel(category: EditorCategory, defaultLocale: string) {
  return (
    category.translations.find(
      (translation) => translation.locale === defaultLocale
    )?.name ||
    category.translations[0]?.name ||
    category.slug
  );
}

export function ArticleEditor({
  article,
  categories,
  defaultLocale,
  locales
}: {
  article: EditorArticle;
  categories: EditorCategory[];
  defaultLocale: string;
  locales: string[];
}) {
  const translations = new Map(
    article?.translations.map((translation) => [
      translation.locale,
      translation
    ])
  );
  const editorLocales = Array.from(new Set([defaultLocale, ...locales])).filter(
    Boolean
  );

  return (
    <form action={saveArticleAction} className="grid gap-6">
      {article ? <input name="id" type="hidden" value={article.id} /> : null}
      <section className="admin-card admin-card-bordered p-5">
        <h2 className="admin-section-title">发布设置</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <label>
            <span className="admin-label">Slug</span>
            <input
              className="admin-field"
              name="slug"
              required
              defaultValue={article?.slug || ""}
            />
          </label>
          <label>
            <span className="admin-label">分类</span>
            <select
              className="admin-field"
              name="categoryId"
              defaultValue={article?.categoryId || ""}
            >
              <option value="">未分类</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {categoryLabel(category, defaultLocale)}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="admin-label">状态</span>
            <select
              className="admin-field"
              name="status"
              defaultValue={article?.status || "DRAFT"}
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已发布</option>
            </select>
          </label>
          <label>
            <span className="admin-label">发布时间</span>
            <input
              className="admin-field"
              name="publishedAt"
              type="datetime-local"
              defaultValue={formatDateTimeLocal(article?.publishedAt || null)}
            />
          </label>
        </div>
        <div className="mt-4">
          <ImageUploadField
            defaultValue={
              article?.coverImage || "/images/article-generator-room.png"
            }
            label="封面图"
            name="coverImage"
            placeholder="/images/article-generator-room.png"
          />
        </div>
      </section>

      <section className="admin-card admin-card-bordered p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="admin-section-title">
              <Globe2 aria-hidden className="h-5 w-5" />
              多语言内容
            </h2>
            <p className="mt-2 text-sm leading-6 text-[var(--admin-muted)]">
              标题、摘要、正文与 SEO 元信息
            </p>
          </div>
          <Badge variant="success" className="uppercase">
            默认 {defaultLocale}
          </Badge>
        </div>

        <Tabs className="mt-5" defaultValue={defaultLocale}>
          <TabsList aria-label="文章语言">
            {editorLocales.map((locale) => (
              <TabsTrigger className="uppercase" key={locale} value={locale}>
                {locale}
              </TabsTrigger>
            ))}
          </TabsList>

          {editorLocales.map((locale) => {
            const translation = translations.get(locale);
            return (
              <TabsContent forceMount key={locale} value={locale}>
                <div className="grid gap-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="admin-label">标题</span>
                      <input
                        className="admin-field"
                        name={`title_${locale}`}
                        aria-required={locale === defaultLocale}
                        defaultValue={translation?.title || ""}
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
                  <label className="block">
                    <span className="admin-label">摘要</span>
                    <textarea
                      className="admin-field min-h-24 resize-y"
                      name={`summary_${locale}`}
                      defaultValue={translation?.summary || ""}
                    />
                  </label>
                  <MarkdownEditor
                    defaultValue={translation?.content || ""}
                    label="正文 Markdown"
                    name={`content_${locale}`}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    <label>
                      <span className="admin-label">SEO 描述</span>
                      <textarea
                        className="admin-field min-h-24 resize-y"
                        name={`seoDescription_${locale}`}
                        defaultValue={translation?.seoDescription || ""}
                      />
                    </label>
                    <label>
                      <span className="admin-label">SEO 关键词</span>
                      <textarea
                        className="admin-field min-h-24 resize-y"
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
      </section>

      <Button className="w-fit" label={false} type="submit">
        <Save aria-hidden className="h-4 w-4" />
        保存文章
      </Button>
    </form>
  );
}
