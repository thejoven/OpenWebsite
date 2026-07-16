import { Save, Settings } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  SystemHeader,
  SystemNotice
} from "@/components/admin/system/system-common";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";
import { saveSiteSettingsAction } from "./actions";

export default async function SystemSettingsPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const [query, settings] = await Promise.all([
    searchParams,
    getSiteSettings()
  ]);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="维护站点名称、语言、全局 SEO 和默认社交分享图片。"
        title="系统管理 / 基础配置"
      />
      <SystemNotice error={query.error} saved={query.saved} />

      <Card className="mt-8">
        <CardContent>
          <h2 className="admin-section-title">
            <Settings aria-hidden className="h-5 w-5" />
            网站基础配置
          </h2>
          <form action={saveSiteSettingsAction} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="admin-label">网站名称</span>
                <input
                  className="admin-field"
                  defaultValue={settings.siteName}
                  name="siteName"
                  required
                />
              </label>
              <label>
                <span className="admin-label">网站 URL</span>
                <input
                  className="admin-field"
                  defaultValue={settings.siteUrl}
                  name="siteUrl"
                  required
                  type="url"
                />
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="admin-label">支持语言</span>
                <input
                  className="admin-field"
                  defaultValue={settings.supportedLocales.join(",")}
                  name="supportedLocales"
                  placeholder="zh,en,pt"
                  required
                />
              </label>
              <label>
                <span className="admin-label">默认语言</span>
                <input
                  className="admin-field"
                  defaultValue={settings.defaultLocale}
                  name="defaultLocale"
                  required
                />
              </label>
            </div>
            <label>
              <span className="admin-label">全站 SEO 标题</span>
              <input
                className="admin-field"
                defaultValue={settings.seoTitle}
                name="seoTitle"
                required
              />
            </label>
            <label>
              <span className="admin-label">全站 SEO 描述</span>
              <textarea
                className="admin-field min-h-24 resize-y"
                defaultValue={settings.seoDescription}
                name="seoDescription"
                required
              />
            </label>
            <label>
              <span className="admin-label">全站 SEO 关键词</span>
              <textarea
                className="admin-field min-h-20 resize-y"
                defaultValue={settings.seoKeywords}
                name="seoKeywords"
              />
            </label>
            <ImageUploadField
              defaultValue={settings.ogImage}
              label="默认 OG 图片"
              name="ogImage"
              placeholder="/images/og-industrial-power.png"
            />
            <Button className="w-fit" type="submit">
              <Save aria-hidden className="h-4 w-4" />
              保存配置
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
