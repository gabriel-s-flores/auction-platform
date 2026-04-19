import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import type { SubmitAuctionEditUseCase } from "#application/use-cases/submit-auction-edit.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const auctionIdParamSchema = z.object({
  auctionId: z.string().trim().regex(UUID_REGEX, { message: "UUID inválido" }),
});

const submitAuctionEditBodySchema = z.discriminatedUnion("editType", [
  z.object({
    editType: z.literal("TITLE"),
    title: z.string().trim().min(3).max(200),
  }),
  z.object({
    editType: z.literal("DESCRIPTION"),
    description: z.string().max(5000).nullable(),
  }),
]);

export class SubmitAuctionEditController {
  constructor(private readonly submitAuctionEdit: SubmitAuctionEditUseCase) {}

  async handle(request: FastifyRequest, reply: FastifyReply) {
    const params = auctionIdParamSchema.parse(request.params);
    const body = submitAuctionEditBodySchema.parse(request.body);
    const user = request.user as AuthenticatedUser;

    const result = await this.submitAuctionEdit.execute({
      auctionId: params.auctionId,
      submittedById: user.sub,
      editType: body.editType,
      title: body.editType === "TITLE" ? body.title : undefined,
      description: body.editType === "DESCRIPTION" ? body.description : undefined,
      ipAddress: request.ip,
      userAgent: request.headers["user-agent"],
    });

    return reply.status(201).send({ data: result });
  }
}