import type { FastifyReply } from "fastify";

import type { ListAdminsUseCase } from "#application/use-cases/admin/list-admins.use-case";

export class ListAdminsController {
  constructor(private readonly listAdmins: ListAdminsUseCase) {}

  async handle(reply: FastifyReply) {
    const admins = await this.listAdmins.execute();

    return reply.send({ data: admins });
  }
}