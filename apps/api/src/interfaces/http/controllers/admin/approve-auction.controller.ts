import type { FastifyReply, FastifyRequest } from "fastify";

import { type ApproveAuctionUseCase } from "#application/use-cases/admin/approve-auction.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class ApproveAuctionController {
 constructor(private readonly approveAuction: ApproveAuctionUseCase) {}

 async handle(request: FastifyRequest, reply: FastifyReply) {
 const user = request.user as AuthenticatedUser;
 const { auctionId } = request.params as { auctionId: string };

 await this.approveAuction.execute({
 auctionId,
 adminId: user.sub,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"]
 });

 return reply.status(204).send();
 }
}
