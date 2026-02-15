import type {
  AuctionDto,
  CreateAuctionRequest,
  CreateAuctionResponse,
  GetAuctionByIdResponse,
  ListOpenAuctionsResponse,
  PlaceBidRequest,
  PlaceBidResponse
} from "@auction/shared-types";

import { httpClient } from "@/shared/api/http-client";

async function listOpen(): Promise<AuctionDto[]> {
  const { data } = await httpClient.get<ListOpenAuctionsResponse>("/auctions");
  return data.data;
}

async function getById(auctionId: string): Promise<AuctionDto> {
  const { data } = await httpClient.get<GetAuctionByIdResponse>(`/auctions/${auctionId}`);
  return data.data;
}

async function create(payload: CreateAuctionRequest): Promise<AuctionDto> {
  const { data } = await httpClient.post<CreateAuctionResponse>("/auctions", payload);
  return data.data;
}

async function placeBid(auctionId: string, payload: PlaceBidRequest): Promise<PlaceBidResponse["data"]> {
  const { data } = await httpClient.post<PlaceBidResponse>(`/auctions/${auctionId}/bids`, payload);
  return data.data;
}

async function close(auctionId: string): Promise<void> {
  await httpClient.patch(`/auctions/${auctionId}/close`);
}

export const auctionsService = {
  listOpen,
  getById,
  create,
  placeBid,
  close
};
