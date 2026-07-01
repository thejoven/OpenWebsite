import { defineConfig } from "prisma/config";

try {
  process.loadEnvFile?.(".env");
} catch {
  // Docker and hosted environments usually provide env vars directly.
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  }
});
