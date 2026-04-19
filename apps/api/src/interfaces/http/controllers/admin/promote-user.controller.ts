import type { FastifyReply, FastifyRequest } from "fastify";

import type { PromoteUserUseCase } from "#application/use-cases/admin/promote-user.use-case";
import { userIdParamSchema } from "#interfaces/http/controllers/admin/user-management-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class PromoteUserController {
  constructor(private readonly promoteUser: PromoteUserUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = userIdParamSchema.parse(request.params);
    const user = request.user as AuthenticatedUser;

    await this.promoteUser.execute({
      actorId: user.sub,
      userId: params.userId,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}