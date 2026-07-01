# OpenWebsite AI API Reference

All endpoints require either an admin session cookie or:

```http
Authorization: Bearer $AI_OPS_TOKEN
```

Base URL is the deployed site origin.

## GET /api/ai/context

Returns:

- product positioning
- current site settings and supported locales
- content/media counts
- route patterns for custom frontends
- endpoint list
- documentation, downloads, and skill paths

## GET /api/ai/docs

Returns the human-facing operations guide as `text/markdown`.

Use `GET /api/ai/docs?download=1` to force a Markdown file download.

## GET /api/ai/skills

Returns `openwebsite-ai-ops.zip` as `application/zip`.

The archive contains the Codex skill entrypoint, API reference, agent display metadata, the Markdown
operations guide, and a generated `manifest.json` with base URL, auth hints, endpoint list, and
install path.

## GET|PATCH /api/ai/site-settings

Patch payload:

```json
{
  "siteName": "SWT Power",
  "siteUrl": "https://example.com",
  "defaultLocale": "zh",
  "supportedLocales": ["zh", "en"],
  "seoTitle": "SWT Power | Industrial power solutions",
  "seoDescription": "Industrial generator sets, gas power stations, and service content.",
  "seoKeywords": "generator, gas power, diesel generator",
  "ogImage": "/uploads/2026/07/cover.webp"
}
```

Locale changes update `src/generated/site-settings.ts`; rebuild/restart production after changing
locales.

## GET|POST /api/ai/categories

`POST` upserts by `slug`.

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

## GET|POST /api/ai/articles

Filters:

- `?status=PUBLISHED`
- `?category=industrial-power`

`POST` upserts by `slug`.

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

## GET|PATCH|DELETE /api/ai/articles/:idOrSlug

Use article id or slug. `PATCH` accepts the same fields as article `POST` and preserves omitted
translations.

## GET|POST /api/ai/media

`GET /api/ai/media?limit=100` lists recent uploads.

`POST` accepts multipart form data:

```bash
curl -H "Authorization: Bearer $AI_OPS_TOKEN" \
  -F "file=@./cover.webp" \
  https://example.com/api/ai/media
```

Response `data.url` can be used as article `coverImage` or Markdown image URL.

## GET /api/ai/seo-audit

Returns average score, page count, issue count, and page-level audits. Use this after content writes.
