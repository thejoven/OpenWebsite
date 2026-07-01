export const aiOpsEndpoints = [
  "GET /api/ai/context",
  "GET|PATCH /api/ai/site-settings",
  "GET|POST /api/ai/categories",
  "GET|POST /api/ai/articles",
  "GET|PATCH|DELETE /api/ai/articles/:idOrSlug",
  "GET|POST /api/ai/media",
  "GET /api/ai/seo-audit",
  "GET /api/ai/docs",
  "GET /api/ai/skills"
] as const;

export const aiOpsDownloads = {
  markdown: "/api/ai/docs?download=1",
  skillPackage: "/api/ai/skills"
} as const;

export const aiOpsSkillName = "openwebsite-ai-ops";
