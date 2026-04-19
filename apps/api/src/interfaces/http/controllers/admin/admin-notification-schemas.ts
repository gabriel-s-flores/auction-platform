import { z } from "zod";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const listAdminNotificationsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const adminNotificationIdParamSchema = z.object({
  notificationId: z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }),
});