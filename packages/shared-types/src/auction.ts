export type AuctionStatus = "OPEN" | "CLOSED";

export interface AuctionDto {
  id: string;
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: AuctionStatus;
  endsAt: string;
  sellerId: string;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface BidDto {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  createdAt: string;
}

export interface ListOpenAuctionsResponse {
  data: AuctionDto[];
}

export interface GetAuctionByIdResponse {
  data: AuctionDto;
}

export interface CreateAuctionRequest {
  title: string;
  description: string | null;
  startingPrice: number;
  endsAt: string;
}

export interface CreateAuctionResponse {
  data: AuctionDto;
}

export interface PlaceBidRequest {
  amount: number;
}

export interface PlaceBidPayload {
  bid: BidDto;
}

export interface PlaceBidResponse {
  data: PlaceBidPayload;
}
