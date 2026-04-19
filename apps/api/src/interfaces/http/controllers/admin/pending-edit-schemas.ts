import { z } from "zod";

const EDIT_STATUS = ["PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

export const listPendingEditsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.preprocess(emptyStringToUndefined, z.enum(EDIT_STATUS).optional()),
  auctionId: z.preprocess(
    emptyStringToUndefined,
    z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }).optional()
  ),
});

export const editIdParamSchema = z.object({
  editId: z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }),
});

export const rejectPendingEditBodySchema = z.object({
  reason: z.string().trim().min(5).max(500),
});