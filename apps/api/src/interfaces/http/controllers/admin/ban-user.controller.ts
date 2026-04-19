import type { FastifyReply, FastifyRequest } from "fastify";

import type { BanUserUseCase } from "#application/use-cases/admin/ban-user.use-case";
import { banUserBodySchema, userIdParamSchema } from "#interfaces/http/controllers/admin/user-management-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class BanUserController {
  constructor(private readonly banUser: BanUserUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = userIdParamSchema.parse(request.params);
    const body = banUserBodySchema.parse(request.body);
    const user = request.user as AuthenticatedUser;

    await this.banUser.execute({
      actorId: user.sub,
      actorRole: user.role,
      userId: params.userId,
      reason: body.reason,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}