import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListAdminNotificationsUseCase } from "#application/use-cases/admin/list-admin-notifications.use-case";
import { listAdminNotificationsQuerySchema } from "#interfaces/http/controllers/admin/admin-notification-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ListAdminNotificationsController {
  constructor(private readonly listAdminNotifications: ListAdminNotificationsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = listAdminNotificationsQuerySchema.parse(request.query);
    const user = request.user as AuthenticatedUser;
    const notifications = await this.listAdminNotifications.execute(user.sub, query.limit);

    return reply.send({ data: notifications });
  }
}