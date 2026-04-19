import type { FastifyReply, FastifyRequest } from "fastify";

import type { GetUserDetailUseCase } from "#application/use-cases/admin/get-user-detail.use-case";
import { userIdParamSchema } from "#interfaces/http/controllers/admin/user-management-schemas";

export class GetUserDetailController {
  constructor(private readonly getUserDetail: GetUserDetailUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = userIdParamSchema.parse(request.params);
    const result = await this.getUserDetail.execute(params.userId);

    return reply.send({ data: result });
  }
}