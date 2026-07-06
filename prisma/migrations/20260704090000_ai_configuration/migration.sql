-- CreateTable
CREATE TABLE "AiConfiguration" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "providerName" TEXT NOT NULL DEFAULT 'OpenAI Compatible',
    "baseUrl" TEXT NOT NULL DEFAULT 'https://api.openai.com/v1',
    "model" TEXT NOT NULL DEFAULT 'gpt-4o-mini',
    "apiKey" TEXT,
    "temperature" REAL NOT NULL DEFAULT 0.2,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
