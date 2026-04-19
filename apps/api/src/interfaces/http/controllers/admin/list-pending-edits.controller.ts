import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListPendingEditsUseCase } from "#application/use-cases/admin/list-pending-edits.use-case";
import { listPendingEditsQuerySchema } from "#interfaces/http/controllers/admin/pending-edit-schemas";

export class ListPendingEditsController {
  constructor(private readonly listPendingEdits: ListPendingEditsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = listPendingEditsQuerySchema.parse(request.query);
    const result = await this.listPendingEdits.execute(query);

    return reply.send(result);
  }
}