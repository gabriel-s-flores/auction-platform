import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListUsersUseCase } from "#application/use-cases/admin/list-users.use-case";
import { listUsersQuerySchema } from "#interfaces/http/controllers/admin/user-management-schemas";

export class ListUsersController {
  constructor(private readonly listUsers: ListUsersUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = listUsersQuerySchema.parse(request.query);
    const result = await this.listUsers.execute(query);

    return reply.send(result);
  }
}