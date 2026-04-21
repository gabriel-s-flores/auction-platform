import type { AuctionRepository } from "#domain/repositories/auction-repository";

export interface ListUserWinsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export interface UserWinOutput {
  auctionId: string;
  title: string;
  finalBid: number;
  endsAt: string;
  sellerId: string;
  sellerName: string;
}

export interface ListUserWinsOutput {
  data: UserWinOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUserWinsUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) {}

  async execute(input: ListUserWinsInput): Promise<ListUserWinsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.auctionRepository.listWinsByBidder({
      userId: input.userId,
      page,
      limit,
    });

    return {
      data: result.data.map((win) => ({
        auctionId: win.auctionId,
        title: win.title,
        finalBid: win.finalBid,
        endsAt: win.endsAt.toISOString(),
        sellerId: win.sellerId,
        sellerName: win.sellerName,
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}