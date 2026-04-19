export type AuctionStatus = "PENDING_APPROVAL" | "OPEN" | "CLOSED" | "REJECTED";
export type EditType = "TITLE" | "DESCRIPTION" | "IMAGES";

export interface ImageDto {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
}

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
  rejectionReason: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  images?: ImageDto[];
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

export interface UploadImagesResponse {
  data: ImageDto[];
}

export interface ReorderImagesRequest {
  positions: Array<{
    id: string;
    position: number;
    isPrimary: boolean;
  }>;
}

export interface GetAuctionImagesResponse {
  data: ImageDto[];
}