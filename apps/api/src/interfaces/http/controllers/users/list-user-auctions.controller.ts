import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListUserAuctionsUseCase } from "#application/use-cases/list-user-auctions.use-case";
import { listUserAuctionsQuerySchema } from "#interfaces/http/controllers/users/user-panel-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ListUserAuctionsController {
  constructor(private readonly listUserAuctions: ListUserAuctionsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;
    const query = listUserAuctionsQuerySchema.parse(request.query);
    const result = await this.listUserAuctions.execute({
      userId: user.sub,
      ...query,
    });

    return reply.send(result);
  }
}