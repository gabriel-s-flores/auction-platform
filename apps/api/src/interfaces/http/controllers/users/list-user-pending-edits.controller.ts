import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListUserPendingEditsUseCase } from "#application/use-cases/list-user-pending-edits.use-case";
import { listUserPendingEditsQuerySchema } from "#interfaces/http/controllers/users/user-panel-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ListUserPendingEditsController {
  constructor(private readonly listUserPendingEdits: ListUserPendingEditsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;
    const query = listUserPendingEditsQuerySchema.parse(request.query);
    const result = await this.listUserPendingEdits.execute({
      userId: user.sub,
      ...query,
    });

    return reply.send(result);
  }
}