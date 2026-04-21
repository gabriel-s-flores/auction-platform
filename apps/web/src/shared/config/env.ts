const requiredVars = ["VITE_APP_NAME"] as const;

const DEFAULT_DEV_API_BASE_URL = "http://localhost:3333";

function trimTrailingSlashes(value: string): string {
  let normalizedValue = value;

  while (normalizedValue.endsWith("/")) {
    normalizedValue = normalizedValue.slice(0, -1);
  }

  return normalizedValue;
}

function resolveApiBaseUrl(): string {
  const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredApiBaseUrl) {
    return trimTrailingSlashes(configuredApiBaseUrl);
  }

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_DEV_API_BASE_URL;
}

for (const varName of requiredVars) {
  if (!import.meta.env[varName]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${varName}`);
  }
}

const apiOrigin = resolveApiBaseUrl();

export const env = {
  appName: import.meta.env.VITE_APP_NAME,
  apiOrigin,
  apiBaseUrl: `${apiOrigin}/api`,
  appEnv: import.meta.env.MODE,
};
