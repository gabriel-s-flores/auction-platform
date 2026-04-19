import type { FastifyReply, FastifyRequest } from "fastify";

import type { MarkAdminNotificationReadUseCase } from "#application/use-cases/admin/mark-admin-notification-read.use-case";
import { adminNotificationIdParamSchema } from "#interfaces/http/controllers/admin/admin-notification-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class MarkAdminNotificationReadController {
  constructor(private readonly markAdminNotificationRead: MarkAdminNotificationReadUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = adminNotificationIdParamSchema.parse(request.params);
    const user = request.user as AuthenticatedUser;

    await this.markAdminNotificationRead.execute(params.notificationId, user.sub);

    return reply.status(204).send();
  }
}