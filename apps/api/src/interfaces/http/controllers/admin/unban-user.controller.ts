import type { FastifyReply, FastifyRequest } from "fastify";

import type { UnbanUserUseCase } from "#application/use-cases/admin/unban-user.use-case";
import { userIdParamSchema } from "#interfaces/http/controllers/admin/user-management-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class UnbanUserController {
  constructor(private readonly unbanUser: UnbanUserUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = userIdParamSchema.parse(request.params);
    const user = request.user as AuthenticatedUser;

    await this.unbanUser.execute({
      actorId: user.sub,
      actorRole: user.role,
      userId: params.userId,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}