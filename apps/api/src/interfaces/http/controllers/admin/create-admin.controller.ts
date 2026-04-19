import type { FastifyReply, FastifyRequest } from "fastify";

import type { CreateAdminUseCase } from "#application/use-cases/admin/create-admin.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class CreateAdminController {
  constructor(private readonly createAdmin: CreateAdminUseCase) {}

  async handle(
    request: FastifyRequest<{ Body: { name: string; email: string; password: string } }>,
    reply: FastifyReply
  ) {
    const user = request.user as AuthenticatedUser;
    const admin = await this.createAdmin.execute({
      actorId: user.sub,
      email: request.body.email,
      name: request.body.name,
      password: request.body.password,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(201).send({ data: admin });
  }
}