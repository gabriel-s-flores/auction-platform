import type { FastifyReply, FastifyRequest } from "fastify";

import type { DemoteAdminUseCase } from "#application/use-cases/admin/demote-admin.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class DemoteAdminController {
  constructor(private readonly demoteAdmin: DemoteAdminUseCase) {}

  async handle(request: FastifyRequest<{ Params: { adminId: string } }>, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;

    await this.demoteAdmin.execute({
      actorId: user.sub,
      adminId: request.params.adminId,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}