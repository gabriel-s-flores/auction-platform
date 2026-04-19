import { AppError } from "#application/errors/app-error";
import { type AuditService } from "#application/services/audit-service";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import { prisma } from "#infrastructure/database/prisma-client";

export interface RejectAuctionInput {
 auctionId: string;
 adminId: string;
 reason: string;
 ipAddress?: string;
 userAgent?: string;
}

export class RejectAuctionUseCase {
 constructor(
 private readonly auctionRepository: AuctionRepository,
 private readonly auditService: AuditService
 ) {}

 async execute(input: RejectAuctionInput): Promise<void> {
 const auction = await this.auctionRepository.findById(input.auctionId);

 if (!auction) {
 throw new AppError("Leilão não encontrado", 404);
 }

 if (auction.status !== "PENDING_APPROVAL") {
 throw new AppError("Leilão não está pendente de aprovação", 400);
 }

 if (!input.reason || input.reason.trim().length < 5) {
 throw new AppError("Motivo da rejeição é obrigatório (mínimo 5 caracteres)", 400);
 }

 await prisma.auction.update({
 where: { id: input.auctionId },
 data: {
 status: "REJECTED",
 rejectionReason: input.reason
 }
 });

 await this.auditService.log(
 "AUCTION_REJECTED",
 "auction",
 input.auctionId,
 { title: auction.title, reason: input.reason },
 { actorId: input.adminId, ipAddress: input.ipAddress, userAgent: input.userAgent }
 );
 }
}
