import type { AiConfiguration } from "@prisma/client";
import { prisma } from "./db";
import { trimTrailingSlash } from "./settings";

export const AI_CONFIGURATION_ID = "default";

export type PublicAiConfiguration = {
  providerName: string;
  baseUrl: string;
  model: string;
  temperature: number;
  enabled: boolean;
  hasApiKey: boolean;
  source: "database" | "environment" | "default";
};

export type EffectiveAiConfiguration = PublicAiConfiguration & {
  apiKey: string;
};

const defaultAiConfiguration = {
  providerName: "OpenAI Compatible",
  baseUrl: "https://api.openai.com/v1",
  model: "gpt-4o-mini",
  temperature: 0.2,
  enabled: true
};

function cleanBaseUrl(value: string) {
  return trimTrailingSlash(value.trim()).replace(/\/chat\/completions$/, "");
}

function envAiConfiguration(): EffectiveAiConfiguration | null {
  const apiKey = process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "";
  const model = process.env.AI_MODEL || process.env.OPENAI_MODEL || "";

  if (!apiKey || !model) {
    return null;
  }

  return {
    providerName:
      process.env.AI_PROVIDER_NAME || defaultAiConfiguration.providerName,
    baseUrl: cleanBaseUrl(
      process.env.AI_BASE_URL ||
        process.env.OPENAI_BASE_URL ||
        defaultAiConfiguration.baseUrl
    ),
    model,
    temperature: Number(
      process.env.AI_TEMPERATURE || defaultAiConfiguration.temperature
    ),
    enabled: process.env.AI_ENABLED !== "false",
    hasApiKey: true,
    apiKey,
    source: "environment"
  };
}

export function serializeAiConfiguration(
  row: AiConfiguration | null
): PublicAiConfiguration {
  const envConfig = envAiConfiguration();

  if (row) {
    return {
      providerName: row.providerName,
      baseUrl: cleanBaseUrl(row.baseUrl),
      model: row.model,
      temperature: row.temperature,
      enabled: row.enabled,
      hasApiKey: Boolean(row.apiKey || envConfig?.apiKey),
      source: "database"
    };
  }

  if (envConfig) {
    const { apiKey: _apiKey, ...publicConfig } = envConfig;
    return publicConfig;
  }

  return {
    ...defaultAiConfiguration,
    hasApiKey: false,
    source: "default"
  };
}

export async function getAiConfiguration() {
  const row = await prisma.aiConfiguration.findUnique({
    where: { id: AI_CONFIGURATION_ID }
  });

  return serializeAiConfiguration(row);
}

export async function getEffectiveAiConfiguration(): Promise<EffectiveAiConfiguration | null> {
  const [row, envConfig] = await Promise.all([
    prisma.aiConfiguration.findUnique({ where: { id: AI_CONFIGURATION_ID } }),
    Promise.resolve(envAiConfiguration())
  ]);

  if (row) {
    const apiKey = row.apiKey || envConfig?.apiKey || "";

    if (!row.enabled || !apiKey) {
      return null;
    }

    return {
      providerName: row.providerName,
      baseUrl: cleanBaseUrl(row.baseUrl),
      model: row.model,
      temperature: row.temperature,
      enabled: row.enabled,
      hasApiKey: true,
      apiKey,
      source: "database"
    };
  }

  return envConfig?.enabled ? envConfig : null;
}
