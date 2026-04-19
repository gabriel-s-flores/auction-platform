import type { FastifyReply, FastifyRequest } from "fastify";

import type { ApprovePendingEditUseCase } from "#application/use-cases/admin/approve-pending-edit.use-case";
import { editIdParamSchema } from "#interfaces/http/controllers/admin/pending-edit-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ApprovePendingEditController {
  constructor(private readonly approvePendingEdit: ApprovePendingEditUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = editIdParamSchema.parse(request.params);
    const user = request.user as AuthenticatedUser;

    await this.approvePendingEdit.execute({
      adminId: user.sub,
      editId: params.editId,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}