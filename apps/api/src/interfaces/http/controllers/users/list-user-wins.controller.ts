import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListUserWinsUseCase } from "#application/use-cases/list-user-wins.use-case";
import { listUserWinsQuerySchema } from "#interfaces/http/controllers/users/user-panel-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ListUserWinsController {
  constructor(private readonly listUserWins: ListUserWinsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;
    const query = listUserWinsQuerySchema.parse(request.query);
    const result = await this.listUserWins.execute({
      userId: user.sub,
      ...query,
    });

    return reply.send(result);
  }
}