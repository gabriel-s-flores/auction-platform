const requiredVars = ["VITE_API_BASE_URL", "VITE_APP_NAME"] as const;

for (const varName of requiredVars) {
  if (!import.meta.env[varName]) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${varName}`);
  }
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME,
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  appEnv: import.meta.env.MODE
};
