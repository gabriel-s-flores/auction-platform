import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListActivityLogsUseCase } from "#application/use-cases/admin/list-activity-logs.use-case";
import { listActivityLogsQuerySchema } from "#interfaces/http/controllers/admin/activity-log-query";

export class ListActivityLogsController {
  constructor(private readonly listActivityLogs: ListActivityLogsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = listActivityLogsQuerySchema.parse(request.query);
    const result = await this.listActivityLogs.execute(query);

    return reply.send(result);
  }
}