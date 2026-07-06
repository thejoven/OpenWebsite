---
name: openwebsite-ai-ops
description: Operate an OpenWebsite AI-native website foundation through its admin API. Use when Codex needs to integrate custom frontend templates, manage multilingual categories/articles, upload media, update article/category/site SEO metadata, inspect supported locales, or run SEO audits for a site that ships OpenWebsite backend contracts but not fixed frontend templates.
---

# OpenWebsite AI Ops

OpenWebsite is a template-independent website foundation. Treat the backend as the source of truth
for content, locales, media, sitemap, robots, and SEO metadata; let the user or project provide the
frontend design.

## Workflow

1. Discover the site with `GET /api/ai/context`.
2. Download portable docs with `GET /api/ai/docs?download=1` or the full skill package with
   `GET /api/ai/skills` when bootstrapping another agent.
3. Read existing structure with `GET /api/ai/categories` and `GET /api/ai/articles`.
4. Upload images with `POST /api/ai/media` before referencing them in covers or Markdown.
5. Upsert categories and articles with all required locale translations and SEO fields.
6. Run `GET /api/ai/seo-audit`.
7. Use `POST /api/ai/seo-audit` for configured AI auto-fixes, then manually resolve non-text issues.
8. Rebuild or restart the app after changing supported locales in production.

## Auth

Use either an admin browser session or a Bearer token:

```bash
curl -H "Authorization: Bearer $AI_OPS_TOKEN" http://localhost:3000/api/ai/context
```

The app must be configured with the same `AI_OPS_TOKEN` or `ADMIN_API_TOKEN`.

## Content Rules

- Do not assume a bundled frontend template exists.
- Preserve user-created layouts and styles.
- Keep article body content in Markdown.
- Use `categorySlug` for article writes when possible; it is stable for AI workflows.
- Write SEO per locale: site, category, and article metadata are separate.
- Prefer API writes over direct database edits unless the API cannot express the change.

## References

- Read `references/api.md` for endpoint payloads and response shapes.
- Read project `docs/AI_OPERATIONS.md` when the user wants human-facing setup docs or CLI examples.
- Use `GET /api/ai/skills` to export this skill as a ZIP package for Codex-style agents.
