import type { AuctionStatus } from "#domain/entities/auction";
import type { AuctionRepository } from "#domain/repositories/auction-repository";

export interface ListUserAuctionsInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: AuctionStatus;
}

export interface UserAuctionOutput {
  id: string;
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: AuctionStatus;
  endsAt: string;
  createdAt: string;
  rejectionReason: string | null;
  bidsCount: number;
}

export interface ListUserAuctionsOutput {
  data: UserAuctionOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUserAuctionsUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) {}

  async execute(input: ListUserAuctionsInput): Promise<ListUserAuctionsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.auctionRepository.listBySeller({
      userId: input.userId,
      page,
      limit,
      status: input.status,
    });

    return {
      data: result.data.map((auction) => ({
        id: auction.id,
        title: auction.title,
        description: auction.description,
        startingPrice: auction.startingPrice,
        highestBid: auction.highestBid,
        status: auction.status,
        endsAt: auction.endsAt.toISOString(),
        createdAt: auction.createdAt.toISOString(),
        rejectionReason: auction.rejectionReason,
        bidsCount: auction.bidsCount,
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