import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetUserDashboardSummaryUseCase } from "#application/use-cases/get-user-dashboard-summary.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class GetUserDashboardController {
  constructor(private readonly getUserDashboardSummary: GetUserDashboardSummaryUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const user = request.user as AuthenticatedUser;
    const result = await this.getUserDashboardSummary.execute(user.sub);

    return reply.send({ data: result });
  }
}