import type { FastifyReply, FastifyRequest } from "fastify";

import { type RejectAuctionUseCase } from "#application/use-cases/admin/reject-auction.use-case";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

export class RejectAuctionController {
 constructor(private readonly rejectAuction: RejectAuctionUseCase) {}

 async handle(request: FastifyRequest, reply: FastifyReply) {
 const user = request.user as AuthenticatedUser;
 const { auctionId } = request.params as { auctionId: string };
 const { reason } = request.body as { reason: string };

 await this.rejectAuction.execute({
 auctionId,
 adminId: user.sub,
 reason,
 ipAddress: request.ip,
 userAgent: request.headers["user-agent"]
 });

 return reply.status(204).send();
 }
}
