import type { FastifyReply } from "fastify";

import type { GetDashboardStatsUseCase } from "#application/use-cases/admin/get-dashboard-stats.use-case";

export class GetDashboardStatsController {
  constructor(private readonly getDashboardStats: GetDashboardStatsUseCase) {}

  async handle(reply: FastifyReply) {
    const stats = await this.getDashboardStats.execute();

    return reply.send({ data: stats });
  }
}