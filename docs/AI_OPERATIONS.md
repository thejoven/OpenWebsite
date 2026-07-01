# AI Operations Guide

OpenWebsite is an AI-native website foundation. It intentionally avoids shipping fixed frontend
templates. The product promise is a stable backend contract for content, multilingual routing,
article pages, category SEO, article SEO, media uploads, sitemap, robots, and metadata.

Use this document when an AI coding agent needs to operate or integrate a site built on this
system.

## Auth

Admin UI requests can use the normal admin session cookie. CLI and AI coding agents should use a
Bearer token:

```bash
export AI_OPS_TOKEN="replace-with-a-long-random-token"
curl -H "Authorization: Bearer $AI_OPS_TOKEN" http://localhost:3000/api/ai/context
```

Set the same `AI_OPS_TOKEN` in the app environment. `ADMIN_API_TOKEN` is also accepted as a
fallback name.

## Discovery

```http
GET /api/ai/context
GET /api/ai/docs
GET /api/ai/docs?download=1
GET /api/ai/skills
```

Returns product positioning, current site settings, route patterns, resource counts, and the list
of AI operations endpoints. `GET /api/ai/docs` returns this Markdown document as `text/markdown`.
Use `?download=1` to download it as `AI_OPERATIONS.md`.

`GET /api/ai/skills` returns `openwebsite-ai-ops.zip`. The package includes:

- `SKILL.md` for Codex-style skill installation
- `references/api.md` endpoint payload and response reference
- `agents/openai.yaml` agent display metadata
- `docs/AI_OPERATIONS.md` for human setup docs
- `manifest.json` with the generated base URL, auth hints, endpoints, and install path

## Site Settings

```http
GET /api/ai/site-settings
PATCH /api/ai/site-settings
```

Patch payload:

```json
{
  "siteName": "SWT Power",
  "siteUrl": "https://example.com",
  "defaultLocale": "zh",
  "supportedLocales": ["zh", "en", "pt"],
  "seoTitle": "SWT Power | Industrial power solutions",
  "seoDescription": "Industrial generator sets, gas power stations, and service content.",
  "seoKeywords": "generator, gas power, diesel generator",
  "ogImage": "/uploads/2026/07/cover.webp"
}
```

Changing `supportedLocales` updates the generated settings snapshot used by middleware and metadata.
Rebuild or restart the app after changing languages in production.

## Categories

```http
GET /api/ai/categories
POST /api/ai/categories
```

`POST` is an upsert by `slug`.

```json
{
  "slug": "industrial-power",
  "sortOrder": 10,
  "translations": {
    "zh": {
      "name": "工业电力",
      "description": "柴油、燃气与混合能源解决方案。",
      "seoTitle": "工业电力解决方案",
      "seoDescription": "面向工业企业的柴油发电、燃气发电与备用电源内容。",
      "seoKeywords": "工业电力,柴油发电机,燃气发电"
    },
    "en": {
      "name": "Industrial Power",
      "description": "Diesel, gas and hybrid power solutions.",
      "seoTitle": "Industrial Power Solutions",
      "seoDescription": "Diesel generator, gas power, and standby power content for industrial teams.",
      "seoKeywords": "industrial power,diesel generator,gas power"
    }
  }
}
```

Category SEO is stored per locale. Current frontend uses category filtering on `/articles`; custom
frontends can create dedicated category landing pages using these fields.

## Articles

```http
GET /api/ai/articles
GET /api/ai/articles?status=PUBLISHED
GET /api/ai/articles?category=industrial-power
POST /api/ai/articles
GET /api/ai/articles/:idOrSlug
PATCH /api/ai/articles/:idOrSlug
DELETE /api/ai/articles/:idOrSlug
```

`POST` is an upsert by `slug`. `PATCH` can use either id or slug.

```json
{
  "slug": "diesel-generator-selection-guide",
  "categorySlug": "industrial-power",
  "coverImage": "/uploads/2026/07/generator-room.webp",
  "status": "PUBLISHED",
  "publishedAt": "2026-07-01T08:00:00.000Z",
  "translations": {
    "zh": {
      "title": "工业企业如何选择柴油发电机组",
      "summary": "从功率、负载、冗余、噪音和运维角度建立选型框架。",
      "content": "## 先明确负载类型\n\n正文 Markdown...",
      "seoTitle": "柴油发电机组选型指南",
      "seoDescription": "面向工业企业的柴油发电机组选型指南，覆盖功率、负载、冗余和运维。",
      "seoKeywords": "柴油发电机,备用电源,工业电力"
    },
    "en": {
      "title": "How industrial teams choose diesel generator sets",
      "summary": "A practical framework for sizing standby power.",
      "content": "## Start with the load profile\n\nMarkdown body...",
      "seoTitle": "Diesel Generator Selection Guide",
      "seoDescription": "A practical diesel generator selection guide for industrial companies.",
      "seoKeywords": "diesel generator,standby power,industrial power"
    }
  }
}
```

Article pages use `seoTitle`, `seoDescription`, `seoKeywords`, and `coverImage` in metadata.
Content is Markdown.

## Media

```http
GET /api/ai/media
GET /api/ai/media?limit=100
POST /api/ai/media
```

Upload images with multipart form data:

```bash
curl -H "Authorization: Bearer $AI_OPS_TOKEN" \
  -F "file=@./cover.webp" \
  http://localhost:3000/api/ai/media
```

The response includes a public `url` that can be used as an article `coverImage` or Markdown image.
Supported formats: JPG, PNG, WebP, GIF, SVG. Max size: 5MB.

## SEO Audit

```http
GET /api/ai/seo-audit
```

Runs the same local SEO doctor used in the admin UI. It checks:

- site SEO title and description
- localhost canonical risk
- category name, description, and per-locale SEO fields
- article SEO title and description
- article body length and Markdown structure
- cover image and category assignment

## Frontend Integration Contract

Custom frontends should rely on the data contract, not a bundled template:

- Supported locales come from `/api/ai/context` or generated `src/generated/site-settings.ts`.
- Public article routes follow `/:locale/articles/:slug`.
- Public article list route follows `/:locale/articles`.
- Article content is Markdown and can be rendered with `react-markdown` or any Markdown renderer.
- SEO metadata should prefer per-article fields, then category/site fallbacks.
- Sitemap and robots are provided by the app and should not be duplicated in templates.

## Suggested AI Agent Workflow

1. Call `GET /api/ai/context`.
2. Download docs with `GET /api/ai/docs?download=1` or the skill package with `GET /api/ai/skills`
   when bootstrapping a new agent.
3. Read current categories with `GET /api/ai/categories`.
4. Upload needed images with `POST /api/ai/media`.
5. Upsert categories and articles with localized SEO fields.
6. Run `GET /api/ai/seo-audit`.
7. Fix the lowest-score pages first.
8. Rebuild/restart when locale configuration changes in production.
