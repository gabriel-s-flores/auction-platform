import { prisma } from "#infrastructure/database/prisma-client";

export interface RecentAuctionSummaryOutput {
  id: string;
  title: string;
  status: string;
  highestBid: number;
  endsAt: string;
  sellerName: string;
  winnerName: string | null;
}

export class ListDashboardRecentAuctionsUseCase {
  async execute(limit = 5): Promise<RecentAuctionSummaryOutput[]> {
    const auctions = await prisma.auction.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        seller: {
          select: {
            name: true,
          },
        },
        bids: {
          take: 1,
          orderBy: {
            amount: "desc",
          },
          include: {
            bidder: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    return auctions.map((auction) => ({
      id: auction.id,
      title: auction.title,
      status: auction.status,
      highestBid: auction.highestBid,
      endsAt: auction.endsAt.toISOString(),
      sellerName: auction.seller.name,
      winnerName: auction.status === "CLOSED" ? auction.bids[0]?.bidder.name ?? null : null,
    }));
  }
}