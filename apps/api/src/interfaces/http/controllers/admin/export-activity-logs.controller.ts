import type { FastifyReply, FastifyRequest } from "fastify";

import type { ExportActivityLogsUseCase } from "#application/use-cases/admin/export-activity-logs.use-case";
import { exportActivityLogsQuerySchema } from "#interfaces/http/controllers/admin/activity-log-query";

export class ExportActivityLogsController {
  constructor(private readonly exportActivityLogs: ExportActivityLogsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = exportActivityLogsQuerySchema.parse(request.query);
    const result = await this.exportActivityLogs.execute(query);

    return reply.send(result);
  }
}