import {
  Bot,
  CheckCircle2,
  Save,
  ShieldCheck,
  SlidersHorizontal
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import {
  SystemHeader,
  SystemNotice
} from "@/components/admin/system/system-common";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAiConfiguration } from "@/lib/ai-configuration";
import { requireAdmin } from "@/lib/auth";
import { saveAiConfigurationAction } from "../actions";

export default async function SystemAiPage({
  searchParams
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const [query, aiConfig] = await Promise.all([
    searchParams,
    getAiConfiguration()
  ]);
  const isReady =
    aiConfig.enabled && aiConfig.hasApiKey && Boolean(aiConfig.model);

  return (
    <AdminShell email={session.email}>
      <SystemHeader
        description="配置服务端 AI 供应商，用于 SEO 诊断的自动矫正。"
        title="系统管理 / AI 配置"
      />
      <SystemNotice error={query.error} saved={query.saved} />

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <Bot aria-hidden className="h-5 w-5 text-[var(--admin-green)]" />
            <p className="mt-3 text-2xl font-bold text-white">
              {aiConfig.providerName}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">
              供应商
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <SlidersHorizontal
              aria-hidden
              className="h-5 w-5 text-[var(--admin-green)]"
            />
            <p className="mt-3 break-all text-2xl font-bold text-white">
              {aiConfig.model}
            </p>
            <p className="text-sm font-bold text-[var(--admin-muted)]">模型</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ShieldCheck
              aria-hidden
              className="h-5 w-5 text-[var(--admin-green)]"
            />
            <div className="mt-4">
              <Badge variant={isReady ? "success" : "warning"}>
                {isReady ? "可用" : "待配置"}
              </Badge>
            </div>
            <p className="mt-3 text-sm font-bold text-[var(--admin-muted)]">
              {aiConfig.source === "environment" ? "环境变量" : "后台配置"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardContent>
          <h2 className="admin-section-title">
            <CheckCircle2 aria-hidden className="h-5 w-5" />
            AI 接口
          </h2>
          <form action={saveAiConfigurationAction} className="mt-5 grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label>
                <span className="admin-label">供应商名称</span>
                <input
                  className="admin-field"
                  defaultValue={aiConfig.providerName}
                  name="providerName"
                  required
                />
              </label>
              <label>
                <span className="admin-label">模型</span>
                <input
                  className="admin-field"
                  defaultValue={aiConfig.model}
                  name="model"
                  required
                />
              </label>
            </div>
            <label>
              <span className="admin-label">Base URL</span>
              <input
                className="admin-field"
                defaultValue={aiConfig.baseUrl}
                name="baseUrl"
                required
                type="url"
              />
            </label>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
              <label>
                <span className="admin-label">API Key</span>
                <input
                  className="admin-field"
                  name="apiKey"
                  placeholder={
                    aiConfig.hasApiKey ? "已保存，留空保持不变" : "sk-..."
                  }
                  type="password"
                />
              </label>
              <label>
                <span className="admin-label">温度</span>
                <input
                  className="admin-field"
                  defaultValue={aiConfig.temperature}
                  max={1}
                  min={0}
                  name="temperature"
                  step={0.1}
                  type="number"
                />
              </label>
            </div>
            <label className="flex items-center gap-3 text-sm font-bold text-[var(--admin-muted-strong)]">
              <input
                className="size-4 accent-[var(--admin-green)]"
                defaultChecked={aiConfig.enabled}
                name="enabled"
                type="checkbox"
              />
              启用 AI 自动矫正
            </label>
            <Button className="w-fit" type="submit">
              <Save aria-hidden className="h-4 w-4" />
              保存 AI 配置
            </Button>
          </form>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
