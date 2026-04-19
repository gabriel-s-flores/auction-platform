import type { FastifyReply, FastifyRequest } from "fastify";

import type { ListPendingAuctionsUseCase } from "#application/use-cases/admin/list-pending-auctions.use-case";

export class ListPendingAuctionsController {
  constructor(private readonly listPendingAuctions: ListPendingAuctionsUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const query = request.query as { page?: string; limit?: string };
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const result = await this.listPendingAuctions.execute({ page, limit });
    const totalPages = Math.ceil(result.total / limit);

    return reply.send({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages,
      },
    });
  }
}
