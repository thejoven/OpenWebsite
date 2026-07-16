import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  Bot,
  Code2,
  Download,
  FileArchive,
  FileText,
  KeyRound,
  PackageOpen,
  TerminalSquare
} from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
import { aiOpsDownloads, aiOpsEndpoints } from "@/lib/ai-ops-links";
import { getSiteSettings } from "@/lib/settings";

async function readDocPreview() {
  try {
    return await readFile(
      path.join(process.cwd(), "docs", "AI_OPERATIONS.md"),
      "utf8"
    );
  } catch {
    return "# AI Operations\n\nDocumentation file is missing.";
  }
}

export default async function AiOpsPage() {
  const session = await requireAdmin();
  const [settings, doc] = await Promise.all([
    getSiteSettings(),
    readDocPreview()
  ]);

  const baseUrl = settings.siteUrl;
  const endpoints = aiOpsEndpoints;

  return (
    <AdminShell email={session.email}>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">AI 运维接口</h1>
          <p className="admin-page-description">
            面向 Codex
            和懂开发的用户，提供内容、多语言、SEO、媒体上传的稳定接口和随项目分发的
            skill 下载包。
          </p>
        </div>
        <span className="admin-badge admin-badge-success gap-2 px-4 py-3">
          <Bot aria-hidden className="h-4 w-4" />
          AI-native ops
        </span>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <section className="admin-card admin-card-bordered p-5">
          <h2 className="admin-section-title">
            <KeyRound aria-hidden className="h-5 w-5" />
            鉴权
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
            后台登录 session 可访问；命令行或 AI agent 建议设置环境变量
            `AI_OPS_TOKEN`，请求时使用 Bearer token。
          </p>
          <pre className="admin-code-block mt-4 text-xs leading-6">
            <code>{`curl -H "Authorization: Bearer $AI_OPS_TOKEN" \\
  ${baseUrl}/api/ai/context`}</code>
          </pre>
        </section>

        <section className="admin-card admin-card-bordered p-5">
          <h2 className="admin-section-title">
            <FileText aria-hidden className="h-5 w-5" />
            Markdown 文档
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
            预览仍保留在本页；需要给 agent 或协作者时可以直接下载原始 Markdown。
          </p>
          <div className="mt-4">
            <a
              className="focus-ring admin-button admin-button-primary"
              href={aiOpsDownloads.markdown}
            >
              <Download aria-hidden className="h-4 w-4" />
              下载 Markdown
            </a>
          </div>
          <div className="mt-4 grid gap-3 text-sm font-bold">
            <code className="admin-code-pill">docs/AI_OPERATIONS.md</code>
            <code className="admin-code-pill">
              skills/openwebsite-ai-ops/SKILL.md
            </code>
            <code className="admin-code-pill">
              skills/openwebsite-ai-ops/references/api.md
            </code>
          </div>
        </section>

        <section className="admin-card admin-card-bordered p-5">
          <h2 className="admin-section-title">
            <TerminalSquare aria-hidden className="h-5 w-5" />
            接入原则
          </h2>
          <p className="mt-4 text-sm leading-6 text-[var(--admin-muted)]">
            前端模板由用户自定义；系统只保证内容、语言、SEO、媒体、sitemap 与
            metadata 的基础契约稳定。
          </p>
        </section>
      </div>

      <section className="admin-card admin-card-bordered mt-8 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="admin-section-title">
              <PackageOpen aria-hidden className="h-5 w-5" />
              Skill 打包下载
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--admin-muted)]">
              生成包含 `SKILL.md`、API reference、agent 配置、AI_OPERATIONS
              文档和运行时 manifest 的 ZIP 包，便于 Codex 类 agent 快速接入管理。
            </p>
          </div>
          <a
            className="focus-ring admin-button admin-button-primary"
            href={aiOpsDownloads.skillPackage}
          >
            <FileArchive aria-hidden className="h-4 w-4" />
            下载 Skill ZIP
          </a>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <code className="admin-code-pill text-sm">
            GET {aiOpsDownloads.skillPackage}
          </code>
          <code className="admin-code-pill text-sm">
            openwebsite-ai-ops/manifest.json
          </code>
          <code className="admin-code-pill text-sm">
            ~/.codex/skills/openwebsite-ai-ops
          </code>
        </div>
      </section>

      <section className="admin-card admin-card-bordered mt-8 p-5">
        <h2 className="admin-section-title">
          <Code2 aria-hidden className="h-5 w-5" />
          API 清单
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {endpoints.map((endpoint) => (
            <code className="admin-code-pill text-sm" key={endpoint}>
              {endpoint}
            </code>
          ))}
        </div>
      </section>

      <section className="admin-card admin-card-bordered mt-8 p-5">
        <h2 className="admin-section-title">
          <FileText aria-hidden className="h-5 w-5" />
          AI_OPERATIONS.md
        </h2>
        <pre className="admin-code-block mt-5 max-h-[760px] overflow-auto text-xs leading-6">
          <code>{doc}</code>
        </pre>
      </section>
    </AdminShell>
  );
}
