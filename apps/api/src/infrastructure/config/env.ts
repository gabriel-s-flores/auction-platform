import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "staging", "production", "test"]).default("development"),
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  API_PORT: z.coerce.number().default(3333),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatório"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter ao menos 32 caracteres"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME é obrigatório"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY é obrigatório"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET é obrigatório"),
  UPLOAD_MAX_SIZE: z.coerce.number().default(10485760), // 10MB
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(Bun.env);
