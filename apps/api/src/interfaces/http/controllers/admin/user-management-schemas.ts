import { z } from "zod";

const USER_ROLES = ["USER", "ADMIN", "SUPER_ADMIN"] as const;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.preprocess(emptyStringToUndefined, z.string().trim().max(255).optional()),
  role: z.preprocess(emptyStringToUndefined, z.enum(USER_ROLES).optional()),
  isBanned: z.preprocess(
    emptyStringToUndefined,
    z
      .enum(["true", "false"])
      .transform((value) => value === "true")
      .optional()
  ),
});

export const userIdParamSchema = z.object({
  userId: z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }),
});

export const banUserBodySchema = z.object({
  reason: z.string().trim().min(5).max(500),
});