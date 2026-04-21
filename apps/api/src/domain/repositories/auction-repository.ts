import type { Auction, AuctionStatus } from "#domain/entities/auction";
import type { Bid } from "#domain/entities/bid";

export interface CreateAuctionInput {
	title: string;
	description: string | null;
	startingPrice: number;
	endsAt: Date;
	sellerId: string;
}

export interface PlaceBidInput {
	auctionId: string;
	bidderId: string;
	amount: number;
}

export interface PlaceBidResult {
	auction: Auction;
	bid: Bid;
	wasExtended: boolean;
	previousEndsAt: Date;
}

export type CloseAuctionResult = "CLOSED" | "NOT_FOUND" | "FORBIDDEN" | "ALREADY_CLOSED";

export interface UserDashboardSummary {
  totalAuctions: number;
  activeAuctions: number;
  pendingAuctions: number;
  closedAuctions: number;
  rejectedAuctions: number;
  wonAuctions: number;
  activeBidParticipations: number;
}

export interface ListUserAuctionsInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: AuctionStatus;
}

export interface UserAuctionListItem extends Auction {
  bidsCount: number;
}

export interface ListUserWinsInput {
  userId: string;
  page?: number;
  limit?: number;
}

export interface UserWinSummary {
  auctionId: string;
  title: string;
  finalBid: number;
  endsAt: Date;
  sellerId: string;
  sellerName: string;
}

export type UserBidActivityStatus = "LEADING" | "OUTBID" | "WON" | "LOST";

export interface ListUserBidActivityInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: UserBidActivityStatus;
}

export interface UserBidActivitySummary {
  auctionId: string;
  title: string;
  auctionStatus: AuctionStatus;
  auctionEndsAt: Date;
  sellerName: string;
  highestBid: number;
  userHighestBid: number;
  userBidCount: number;
  status: UserBidActivityStatus;
}

export interface AuctionRepository {
	listOpenAuctions: () => Promise<Auction[]>;
	findById: (auctionId: string) => Promise<Auction | null>;
	create: (input: CreateAuctionInput) => Promise<Auction>;
	getUserDashboardSummary: (userId: string) => Promise<UserDashboardSummary>;
	listBySeller: (input: ListUserAuctionsInput) => Promise<{ data: UserAuctionListItem[]; total: number }>;
	listWinsByBidder: (input: ListUserWinsInput) => Promise<{ data: UserWinSummary[]; total: number }>;
	listBidActivityByUser: (
		input: ListUserBidActivityInput
	) => Promise<{ data: UserBidActivitySummary[]; total: number }>;
	close: (auctionId: string, userId: string, isAdmin: boolean) => Promise<CloseAuctionResult>;
	closeExpiredAuctions: (now: Date) => Promise<string[]>;
	placeBid: (input: PlaceBidInput) => Promise<PlaceBidResult>;
}
