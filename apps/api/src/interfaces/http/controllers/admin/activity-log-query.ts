import { z } from "zod";

const ACTION_TYPES = [
  "USER_LOGIN",
  "USER_LOGOUT",
  "LOGIN_FAILED",
  "AUCTION_CREATED",
  "AUCTION_APPROVED",
  "AUCTION_REJECTED",
  "AUCTION_CLOSED",
  "AUCTION_CANCELLED",
  "EDIT_SUBMITTED",
  "EDIT_APPROVED",
  "EDIT_REJECTED",
  "BID_PLACED",
  "BID_OUTBID",
  "ADMIN_CREATED",
  "ADMIN_REMOVED",
  "USER_BANNED",
  "USER_UNBANNED",
  "IMAGE_UPLOADED",
  "IMAGE_DELETED",
] as const;

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

const optionalDateSchema = z.preprocess(
  emptyStringToUndefined,
  z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), { message: "Data inválida" })
    .optional()
);

export const listActivityLogsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  action: z.preprocess(emptyStringToUndefined, z.enum(ACTION_TYPES).optional()),
  entityType: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().max(100).optional()
  ),
  actorId: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }).optional()
  ),
  startDate: optionalDateSchema,
  endDate: optionalDateSchema,
});

export const exportActivityLogsQuerySchema = listActivityLogsQuerySchema.omit({
  page: true,
  limit: true,
});