import { AppError } from "#application/errors/app-error";
import { type AuditService } from "#application/services/audit-service";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import { prisma } from "#infrastructure/database/prisma-client";

export interface ApproveAuctionInput {
 auctionId: string;
 adminId: string;
 ipAddress?: string;
 userAgent?: string;
}

export class ApproveAuctionUseCase {
 constructor(
 private readonly auctionRepository: AuctionRepository,
 private readonly auditService: AuditService
 ) {}

 async execute(input: ApproveAuctionInput): Promise<void> {
 const auction = await this.auctionRepository.findById(input.auctionId);

 if (!auction) {
 throw new AppError("Leilão não encontrado", 404);
 }

 if (auction.status !== "PENDING_APPROVAL") {
 throw new AppError("Leilão não está pendente de aprovação", 400);
 }

 await prisma.auction.update({
 where: { id: input.auctionId },
 data: {
 status: "OPEN",
 approvedById: input.adminId,
 approvedAt: new Date()
 }
 });

 await this.auditService.log(
 "AUCTION_APPROVED",
 "auction",
 input.auctionId,
 { title: auction.title },
 { actorId: input.adminId, ipAddress: input.ipAddress, userAgent: input.userAgent }
 );
 }
}
