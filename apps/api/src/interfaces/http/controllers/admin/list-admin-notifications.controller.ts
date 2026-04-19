import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListAdminNotificationsUseCase } from "#application/use-cases/admin/list-admin-notifications.use-case";

export class ListAdminNotificationsController {
  constructor(private readonly listAdminNotifications: ListAdminNotificationsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { limit?: string };
    const limit = Number(query.limit) || 20;
    const notifications = await this.listAdminNotifications.execute(limit);

    return reply.send({ data: notifications });
  }
}