# AI Agent 企业网站开发指南

本文档面向使用 AI coding agent 开发、改版或维护企业官网的团队。OpenWebsite 的定位不是固定模板，而是提供稳定的企业网站后端契约：内容、多语言、媒体、SEO、sitemap、robots、后台和 AI 运维 API。Agent 应在这个契约上完成前端体验、内容结构、SEO 优化和发布验证。

## 适用场景

- 为制造业、外贸、能源、设备、服务型企业搭建官网
- 在现有 OpenWebsite 项目上更换视觉风格或页面结构
- 批量创建多语言栏目、文章、案例、产品说明和 SEO 元数据
- 通过 `/api/ai/*` 接口让 Agent 管理内容和媒体
- 交付一个可上线、可维护、可被搜索引擎理解的企业网站

## Agent 工作原则

1. 先理解企业业务，再写页面。
2. 优先使用项目已有技术栈、组件和 API。
3. 内容和 SEO 数据优先通过 `/api/ai/*` 写入，不直接改数据库。
4. 前端样式可以高度定制，但必须遵守多语言路由、文章 Markdown、媒体 URL 和 metadata 契约。
5. 每次改动后执行 lint、build 或至少完成可替代的本地验证。
6. 不覆盖用户已有文案、设计和内容，除非任务明确要求重写。

## 开发前信息采集

Agent 开始开发企业网站前，应先整理以下信息：

| 信息            | 说明                               | 示例                             |
| --------------- | ---------------------------------- | -------------------------------- |
| 企业名称        | 用于站点标题、页脚、SEO 和品牌露出 | SWT Power                        |
| 行业定位        | 决定页面结构、视觉气质和关键词     | 工业电力解决方案                 |
| 核心产品 / 服务 | 决定导航、首页模块和内容分类       | 柴油发电机组、燃气电站、运维服务 |
| 目标客户        | 决定语言、证据和 CTA               | 工厂、矿山、数据中心、工程总包   |
| 主要市场        | 决定语言和 SEO 关键词              | 中国、东南亚、中东               |
| 转化目标        | 决定 CTA 和表单字段                | 咨询报价、获取方案、预约沟通     |
| 证明材料        | 决定可信度模块                     | 案例、资质、客户、交付照片       |
| 品牌要求        | 决定色彩、字体和图片风格           | 工业、可靠、国际化               |

如果信息不足，Agent 可以先基于行业常识搭建结构，但必须在最终说明中标注假设。

## 推荐站点结构

企业官网通常至少包含以下页面：

```text
/
/:locale
/:locale/about
/:locale/services
/:locale/articles
/:locale/articles/:slug
/:locale/contact
/admin
```

推荐导航：

- 首页：品牌定位、核心能力、重点产品、应用场景、案例证据、咨询入口
- 关于我们：公司简介、能力、资质、服务网络、价值主张
- 产品 / 服务：按业务线展示解决方案、适用场景、技术优势和交付流程
- 文章 / 资讯：行业知识、选型指南、案例故事、维护建议
- 联系我们：表单、邮箱、电话、地址、服务区域

复杂企业可以增加：

- `/:locale/products`：产品中心
- `/:locale/cases`：案例中心
- `/:locale/downloads`：资料下载
- `/:locale/industries`：行业解决方案

新增页面时要同步考虑 sitemap、metadata、导航入口和移动端可访问性。

## 内容模型与写入方式

OpenWebsite 默认提供以下核心模型：

- `SiteSetting`：站点名称、语言、SEO 默认值、OG 图片
- `Category` + `CategoryTranslation`：文章分类和多语言 SEO
- `Article` + `ArticleTranslation`：文章、多语言正文、摘要和 SEO
- `MediaAsset`：后台和 AI API 上传图片
- `ContactSubmission`：联系表单记录
- `User`：后台管理员

Agent 管理内容时优先使用：

```http
GET /api/ai/context
GET /api/ai/site-settings
PATCH /api/ai/site-settings
GET /api/ai/categories
POST /api/ai/categories
GET /api/ai/articles
POST /api/ai/articles
PATCH /api/ai/articles/:idOrSlug
GET /api/ai/media
POST /api/ai/media
GET /api/ai/seo-audit
POST /api/ai/seo-audit
```

鉴权方式：

```bash
export AI_OPS_TOKEN="replace-with-a-long-random-token"
curl -H "Authorization: Bearer $AI_OPS_TOKEN" http://localhost:3000/api/ai/context
```

接口详情见 `docs/AI_OPERATIONS.md` 和 `skills/openwebsite-ai-ops/references/api.md`。

## 多语言策略

默认支持 `zh,en`。Agent 增加语言时需要同时处理：

1. `SUPPORTED_LOCALES` 环境变量
2. `PATCH /api/ai/site-settings` 中的 `supportedLocales`
3. `src/messages/*.json` 页面固定文案
4. 分类和文章的 `translations`
5. metadata、canonical、hreflang 和 sitemap
6. 生产环境重建或重启

不要只翻译正文而漏掉 SEO 标题、描述、摘要和导航文案。

## 首页开发建议

企业官网首页应优先回答四个问题：

1. 这家公司是谁？
2. 它解决什么具体问题？
3. 为什么可信？
4. 下一步如何联系？

推荐模块顺序：

- 首屏：企业名或核心业务、明确价值主张、主 CTA、真实业务图片
- 能力概览：3 到 5 个核心产品 / 服务
- 应用场景：按客户行业或使用场景组织
- 证据模块：项目经验、资质、交付能力、服务网络
- 内容入口：选型指南、行业文章或案例
- 联系 CTA：表单入口、电话、邮箱或 WhatsApp 等外贸渠道

避免只做营销空话。制造业和 B2B 网站更需要清晰规格、真实图片、案例证据和可联系路径。

## 前端实现约定

开发前端时应遵守项目已有结构：

```text
src/app/[locale]/        # 多语言前台页面
src/components/site/     # 前台组件
src/components/ui/       # 基础 UI 组件
src/lib/                 # 内容、SEO、设置和工具函数
src/messages/            # 多语言固定文案
public/                  # 静态资源
```

实现建议：

- 页面组件优先保持 server component，只有表单、筛选、切换等交互需要 client component。
- 使用 `src/lib/seo.ts`、`src/lib/content.ts`、`src/lib/settings.ts` 中已有能力，不重复写数据访问逻辑。
- 图片使用真实产品、工厂、设备、团队或项目现场，不用无意义装饰图。
- 桌面端和移动端都要检查导航、表单、卡片、表格和长文本换行。
- CTA 文案要具体，例如“获取发电方案”优于“了解更多”。
- 不把后台、AI 运维 token 或环境变量暴露到客户端。

## SEO 开发清单

每个公开页面都应具备：

- 唯一且具体的 `title`
- 80 到 160 字左右的 `description`
- 合理的 canonical
- 多语言页面的 hreflang
- Open Graph 图片
- 清晰的 H1，且每页只有一个主要 H1
- 图片 `alt`
- 可索引的正文内容
- 与业务匹配的内部链接

文章和分类应写入 per-locale SEO 字段：

```json
{
  "seoTitle": "柴油发电机组选型指南 | SWT Power",
  "seoDescription": "面向工厂、矿山和数据中心的柴油发电机组选型方法，覆盖功率、负载、冗余、噪音和运维。",
  "seoKeywords": "柴油发电机,备用电源,工业电力"
}
```

完成内容写入后运行：

```http
GET /api/ai/seo-audit
POST /api/ai/seo-audit
```

优先修复低分页面、缺失描述、标题重复、正文过短和缺少封面图的问题。配置 AI 后可以用
`POST /api/ai/seo-audit` 自动修复可安全改写的文字 SEO 字段。

## 内容生产流程

Agent 批量生产企业网站内容时建议按以下顺序：

1. 读取 `/api/ai/context`，确认语言、URL、现有内容和接口。
2. 更新 `SiteSetting`，补齐站点名、默认语言、SEO 默认值和 OG 图片。
3. 设计分类，例如 `company-news`、`technical-guides`、`case-studies`。
4. 上传封面图和正文图。
5. 创建文章，确保每个 locale 都有标题、摘要、正文、SEO 标题和 SEO 描述。
6. 用文章列表页和详情页检查渲染效果。
7. 运行 SEO audit。
8. 修复问题后再交付。

文章正文建议使用 Markdown：

```markdown
## 先明确负载类型

在选择发电机组前，需要确认连续负载、启动冲击、电机比例和冗余要求。

## 关注运行环境

高温、高海拔、粉尘和噪音限制都会影响机组选型和机房设计。
```

## 图片和媒体规范

- 优先使用 WebP 或压缩后的 JPG。
- 单文件不超过 API 限制，默认 5MB。
- 封面图比例保持一致，建议 16:9 或 4:3。
- 文章正文图片要有业务含义，避免纯装饰。
- 外贸站点避免使用带有不可授权商标、人员肖像或敏感信息的图片。

上传示例：

```bash
curl -H "Authorization: Bearer $AI_OPS_TOKEN" \
  -F "file=@./generator-room.webp" \
  http://localhost:3000/api/ai/media
```

返回的 `data.url` 可用于文章 `coverImage` 或 Markdown 图片。

## 联系表单和转化

企业网站的联系入口应具备：

- 明确 CTA：获取报价、咨询方案、预约沟通
- 基础字段：姓名、邮箱或电话、公司、需求描述
- 服务区域或产品类型字段，视业务复杂度决定
- 提交成功和失败状态
- 频率限制和服务端校验
- 后台查看和 CSV 导出

如果部署 SMTP，应测试邮件通知。没有 SMTP 时，至少确认后台能看到 `ContactSubmission`。

## 后台与 AI 运维

交付前确认：

- `/admin` 可以登录
- 分类和文章可以新增、编辑、发布
- 联系记录可以搜索和导出
- `/admin/ai-ops` 可以查看接口文档
- `/api/ai/docs` 返回 Markdown
- `/api/ai/skills` 可以下载 skill 包
- Bearer token 鉴权有效，错误 token 被拒绝

Agent 应把 OpenWebsite 视为可被自动化管理的网站底座。需要迁移到其他 agent 时，可以使用 `/api/ai/skills` 导出的 skill 包。

## 本地验证

常用命令：

```bash
npm run lint
npm run build
npm run db:migrate
npm run db:seed
npm run dev
```

建议验证路径：

```text
/zh
/en
/zh/about
/zh/services
/zh/articles
/zh/articles/:slug
/zh/contact
/admin
/admin/ai-ops
/api/ai/context
/api/ai/seo-audit
/sitemap.xml
/robots.txt
```

如果当前环境无法运行完整 build，Agent 应说明原因，并列出已经完成的替代验证。

## 发布前验收清单

- 页面结构覆盖企业核心业务
- 桌面端和移动端布局正常
- 导航、页脚、CTA 和联系表单可用
- 中英文或其他语言文案完整
- 文章列表、详情页和分类筛选正常
- 站点、分类和文章 SEO 字段完整
- sitemap、robots、canonical、hreflang 正常
- 图片加载正常，alt 文案合理
- 后台登录、内容管理和联系记录可用
- AI 运维接口鉴权和文档可用
- `npm run lint` 和 `npm run build` 通过，或有明确的未通过原因

## 常用 Agent 提示词

创建企业官网首页：

```text
基于当前 OpenWebsite 项目，为一家工业电力设备企业重做首页。
请先读取现有内容和组件，保留多语言路由和 SEO 契约。
首页需要包含首屏、核心服务、应用场景、可信证据、文章入口和联系 CTA。
完成后运行 lint/build，并说明改动。
```

批量生成内容：

```text
使用 /api/ai/* 为站点创建 3 个文章分类和 8 篇中英文文章。
每篇文章需要 coverImage、summary、Markdown 正文、seoTitle、seoDescription 和 seoKeywords。
完成后运行 /api/ai/seo-audit，并修复低分项。
```

改版并保持内容：

```text
在不删除现有文章和后台功能的前提下，重新设计前台视觉。
保留 /[locale]、/[locale]/articles、/[locale]/articles/[slug]、/[locale]/contact 路由。
请复用已有内容读取和 SEO 工具函数，完成移动端检查。
```

## 交付说明模板

Agent 完成企业网站开发后，建议用以下结构向用户汇报：

```text
已完成：
- 页面和组件改动
- 内容/API 写入
- SEO 和多语言处理
- 后台或 AI 运维相关调整

验证：
- npm run lint
- npm run build
- 手动访问路径
- SEO audit 结果

注意事项：
- 需要用户补充的真实图片或资质
- 生产环境需要配置的变量
- 上线后建议观察的页面和表单
```
