import type { FastifyReply } from "fastify";

import type { ListDashboardRecentAuctionsUseCase } from "#application/use-cases/admin/list-dashboard-recent-auctions.use-case";

export class ListDashboardRecentAuctionsController {
  constructor(
    private readonly listDashboardRecentAuctions: ListDashboardRecentAuctionsUseCase
  ) {}

  async handle(reply: FastifyReply) {
    const auctions = await this.listDashboardRecentAuctions.execute();

    return reply.send({ data: auctions });
  }
}