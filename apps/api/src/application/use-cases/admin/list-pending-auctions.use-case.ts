import type { Auction } from "#domain/entities/auction";
import { prisma } from "#infrastructure/database/prisma-client";

export interface ListPendingAuctionsInput {
 page?: number;
 limit?: number;
}

export interface PendingAuctionWithSeller extends Auction {
 sellerName: string;
 sellerEmail: string;
}

export class ListPendingAuctionsUseCase {
 async execute(input: ListPendingAuctionsInput): Promise<{ data: PendingAuctionWithSeller[]; total: number }> {
 const page = input.page ?? 1;
 const limit = input.limit ?? 20;
 const skip = (page - 1) * limit;

 const [auctions, total] = await Promise.all([
 prisma.auction.findMany({
 where: { status: "PENDING_APPROVAL" },
 skip,
 take: limit,
 orderBy: { createdAt: "asc" },
 include: {
  seller: { select: { name: true, email: true } }
 }
 }),
 prisma.auction.count({ where: { status: "PENDING_APPROVAL" } })
 ]);

 return {
 data: auctions.map(auction => ({
 id: auction.id,
 title: auction.title,
 description: auction.description,
 startingPrice: auction.startingPrice,
 highestBid: auction.highestBid,
 status: auction.status as "PENDING_APPROVAL" | "OPEN" | "CLOSED" | "REJECTED",
 endsAt: auction.endsAt,
 version: auction.version,
 rejectionReason: auction.rejectionReason,
 approvedById: auction.approvedById,
 approvedAt: auction.approvedAt,
 sellerId: auction.sellerId,
 createdAt: auction.createdAt,
 updatedAt: auction.updatedAt,
 sellerName: auction.seller.name,
 sellerEmail: auction.seller.email
 })),
 total
 };
 }
}
