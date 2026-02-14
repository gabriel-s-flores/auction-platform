export type AuctionStatus = "OPEN" | "CLOSED";

export interface Auction {
  id: string;
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: AuctionStatus;
  endsAt: Date;
  sellerId: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}
