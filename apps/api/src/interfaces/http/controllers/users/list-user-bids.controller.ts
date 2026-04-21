import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListUserBidsUseCase } from "#application/use-cases/list-user-bids.use-case";
import { listUserBidsQuerySchema } from "#interfaces/http/controllers/users/user-panel-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ListUserBidsController {
  constructor(private readonly listUserBids: ListUserBidsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;
    const query = listUserBidsQuerySchema.parse(request.query);
    const result = await this.listUserBids.execute({
      userId: user.sub,
      ...query,
    });

    return reply.send(result);
  }
}