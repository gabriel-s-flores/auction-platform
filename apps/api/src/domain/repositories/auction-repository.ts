import type { Auction } from "#domain/entities/auction";
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

export interface AuctionRepository {
	listOpenAuctions: () => Promise<Auction[]>;
	findById: (auctionId: string) => Promise<Auction | null>;
	create: (input: CreateAuctionInput) => Promise<Auction>;
	close: (auctionId: string, userId: string, isAdmin: boolean) => Promise<CloseAuctionResult>;
	placeBid: (input: PlaceBidInput) => Promise<PlaceBidResult>;
}
