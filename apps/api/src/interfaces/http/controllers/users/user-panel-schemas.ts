import { z } from "zod";

const AUCTION_STATUSES = ["PENDING_APPROVAL", "OPEN", "CLOSED", "REJECTED"] as const;
const BID_ACTIVITY_STATUSES = ["LEADING", "OUTBID", "WON", "LOST"] as const;
const EDIT_STATUSES = ["PENDING_APPROVAL", "APPROVED", "REJECTED"] as const;

function emptyStringToUndefined(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? undefined : value;
}

const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const listUserAuctionsQuerySchema = paginationQuerySchema.extend({
  status: z.preprocess(emptyStringToUndefined, z.enum(AUCTION_STATUSES).optional()),
});

export const listUserWinsQuerySchema = paginationQuerySchema;

export const listUserBidsQuerySchema = paginationQuerySchema.extend({
  status: z.preprocess(emptyStringToUndefined, z.enum(BID_ACTIVITY_STATUSES).optional()),
});

export const listUserPendingEditsQuerySchema = paginationQuerySchema.extend({
  status: z.preprocess(emptyStringToUndefined, z.enum(EDIT_STATUSES).optional()),
});