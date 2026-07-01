# OpenWebsite

OpenWebsite 是一个 AI 原生的快速建站底座，基于 Next.js 16 App Router、TypeScript、Tailwind CSS、Prisma 和 SQLite。它不把价值放在固定前端模板上，而是提供稳定的内容、多语言、媒体、SEO、sitemap、robots 和 AI 运维 API 契约，让懂一点开发或使用 Codex 的用户可以把任意前端样式无缝接入。

## 功能

- 多语言前台：`/[locale]` 路由，默认支持 `zh,en`
- 页面基础：首页、关于我们、产品 / 服务、文章列表、文章详情、联系我们
- SEO：动态 metadata、canonical、hreflang、Open Graph、Twitter Card、`sitemap.xml`、`robots.txt`、文章 JSON-LD、站点 / 分类 / 文章独立 SEO 字段
- 后台：管理员登录、分类 CRUD、文章多语言 CRUD、联系记录搜索与 CSV 导出、系统管理、AI 运维接口文档
- AI 运维：`/api/ai/*` 提供站点配置、分类、文章、媒体、SEO 诊断、Markdown 文档下载和 skill 打包下载接口
- 联系接口：服务端校验、基础频率限制、SQLite 入库、可选 SMTP 通知
- 发布：保存文章或分类后触发 `revalidatePath`
- 部署：Docker 多阶段构建，`docker-compose up -d` 一键启动

## 环境要求

```bash
nvm use v23
npm install
```

如果本机没有 Node v23，请先安装：

```bash
nvm install v23
nvm use v23
```

## 本地开发

1. 创建环境变量：

```bash
cp .env.example .env
```

2. 修改 `.env` 中的管理员信息和站点信息，至少建议设置：

```env
AUTH_SECRET="replace-with-a-long-random-secret"
AI_OPS_TOKEN="replace-with-a-long-random-token"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="ChangeMe123!"
SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

3. 初始化数据库：

```bash
npm run db:migrate -- --name init
npm run db:seed
```

4. 启动开发服务：

```bash
npm run dev
```

访问：

- 前台：`http://localhost:3000/zh`
- 后台：`http://localhost:3000/admin`
- AI 运维：`http://localhost:3000/admin/ai-ops`

## 常用命令

```bash
npm run lint
npm run build
npm run start
npm run db:migrate
npm run db:deploy
npm run db:seed
```

## Docker 部署

```bash
cp .env.example .env
docker-compose up -d --build
```

容器启动时会自动执行：

```bash
prisma migrate deploy
npm run db:seed
```

SQLite 数据库默认保存在容器 `/app/data/openwebsite.db`，并通过 `openwebsite_data` volume 持久化。

## 环境变量

| 变量 | 说明 |
| --- | --- |
| `DATABASE_URL` | SQLite 连接，默认 `file:../data/openwebsite.db`，相对 `prisma/schema.prisma` 解析 |
| `SITE_URL` / `NEXT_PUBLIC_SITE_URL` | 站点 URL，用于 canonical、sitemap 和 OG |
| `HOST_PORT` | Docker 暴露到宿主机的端口 |
| `PORT` | 容器内 Next.js 监听端口，默认 3000 |
| `AUTH_SECRET` | 后台会话签名密钥 |
| `AI_OPS_TOKEN` / `ADMIN_API_TOKEN` | AI 运维 API 的 Bearer token |
| `AUTH_COOKIE_SECURE` | 是否给后台 session cookie 加 Secure；HTTP 内网测试设为 `false`，HTTPS 设为 `true` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed 初始化管理员 |
| `DEFAULT_LOCALE` | 默认语言 |
| `SUPPORTED_LOCALES` | 逗号分隔语言列表 |
| `SITE_NAME` / `SITE_DESCRIPTION` / `SITE_KEYWORDS` | SEO 默认值 |
| `SMTP_*` | 可选邮件通知配置 |

## 内容模型

- `Category` + `CategoryTranslation`：分类与多语言名称 / 描述
- `Article` + `ArticleTranslation`：文章基础字段与多语言标题、摘要、正文和 SEO 字段
- `ContactSubmission`：联系表单提交记录
- `User`：后台管理员
- `SiteSetting`：站点基础配置、语言和全站 SEO
- `ScheduledTask`：系统定时任务展示
- `MediaAsset`：后台 / AI API 上传的图片资源

## AI 运维

- 后台入口：`/admin/ai-ops`
- Markdown 文档：`docs/AI_OPERATIONS.md`
- 项目内 Codex skill：`skills/openwebsite-ai-ops`
- API 文档接口：`GET /api/ai/docs`
- Markdown 下载接口：`GET /api/ai/docs?download=1`
- Skill 打包接口：`GET /api/ai/skills`
- 发现接口：`GET /api/ai/context`

AI coding agent 应优先通过 `/api/ai/*` 修改内容和 SEO，而不是直接改数据库。前端模板由用户自己实现；模板只需要遵守多语言路由、文章 Markdown、SEO metadata 和媒体 URL 的契约。

`GET /api/ai/skills` 会动态生成 `openwebsite-ai-ops.zip`，包含 `SKILL.md`、`references/api.md`、`agents/openai.yaml`、`docs/AI_OPERATIONS.md` 和运行时 `manifest.json`。解压到 `~/.codex/skills/openwebsite-ai-ops` 后，类似 Codex 的 agent 可通过站点 URL 与 `AI_OPS_TOKEN` 快速接入管理。

## 目录结构

```text
src/
  app/
    [locale]/        # 多语言前台
    admin/           # 后台管理
    api/ai/          # AI 运维 API
    api/contact/     # 联系接口
    sitemap.ts
    robots.ts
  components/
  i18n/
  lib/
  messages/
prisma/
public/images/
docs/
skills/openwebsite-ai-ops/
```

## 说明

前台公开页面设置了 `revalidate`，并且数据库不可用时会使用内置示例内容回退，保证构建阶段不会因为 SQLite 尚未迁移而失败。实际运行时，后台保存内容后会按 locale 重新验证首页、文章列表和文章详情。
