import type { AuctionStatus } from "#domain/entities/auction";
import type {
  AuctionRepository,
  UserBidActivityStatus,
} from "#domain/repositories/auction-repository";

export interface ListUserBidsInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: UserBidActivityStatus;
}

export interface UserBidActivityOutput {
  auctionId: string;
  title: string;
  auctionStatus: AuctionStatus;
  auctionEndsAt: string;
  sellerName: string;
  highestBid: number;
  userHighestBid: number;
  userBidCount: number;
  status: UserBidActivityStatus;
}

export interface ListUserBidsOutput {
  data: UserBidActivityOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUserBidsUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) {}

  async execute(input: ListUserBidsInput): Promise<ListUserBidsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.auctionRepository.listBidActivityByUser({
      userId: input.userId,
      page,
      limit,
      status: input.status,
    });

    return {
      data: result.data.map((activity) => ({
        auctionId: activity.auctionId,
        title: activity.title,
        auctionStatus: activity.auctionStatus,
        auctionEndsAt: activity.auctionEndsAt.toISOString(),
        sellerName: activity.sellerName,
        highestBid: activity.highestBid,
        userHighestBid: activity.userHighestBid,
        userBidCount: activity.userBidCount,
        status: activity.status,
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