import type { FastifyReply, FastifyRequest } from "fastify";

import type { RejectPendingEditUseCase } from "#application/use-cases/admin/reject-pending-edit.use-case";
import { editIdParamSchema, rejectPendingEditBodySchema } from "#interfaces/http/controllers/admin/pending-edit-schemas";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class RejectPendingEditController {
  constructor(private readonly rejectPendingEdit: RejectPendingEditUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = editIdParamSchema.parse(request.params);
    const body = rejectPendingEditBodySchema.parse(request.body);
    const user = request.user as AuthenticatedUser;

    await this.rejectPendingEdit.execute({
      adminId: user.sub,
      editId: params.editId,
      ipAddress: request.ip,
      reason: body.reason,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(204).send();
  }
}