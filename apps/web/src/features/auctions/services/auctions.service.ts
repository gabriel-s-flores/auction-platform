import type {
  AuctionDto,
  CreateAuctionRequest,
  CreateAuctionResponse,
  GetAuctionByIdResponse,
  GetAuctionImagesResponse,
  ImageDto,
  ListOpenAuctionsResponse,
  PlaceBidRequest,
  PlaceBidResponse,
  ReorderImagesRequest,
  UploadImagesResponse,
} from "@auction/shared-types";

import { httpClient } from "@/shared/api/http-client";

async function listOpen(): Promise<AuctionDto[]> {
  const { data } = await httpClient.get<ListOpenAuctionsResponse>("/auctions");
  return data.data;
}

async function getById(auctionId: string): Promise<AuctionDto> {
  const { data } = await httpClient.get<GetAuctionByIdResponse>(
    `/auctions/${auctionId}`
  );
  return data.data;
}

async function create(payload: CreateAuctionRequest): Promise<AuctionDto> {
  const { data } = await httpClient.post<CreateAuctionResponse>(
    "/auctions",
    payload
  );
  return data.data;
}

async function placeBid(
  auctionId: string,
  payload: PlaceBidRequest
): Promise<PlaceBidResponse["data"]> {
  const { data } = await httpClient.post<PlaceBidResponse>(
    `/auctions/${auctionId}/bids`,
    payload
  );
  return data.data;
}

async function close(auctionId: string): Promise<void> {
  await httpClient.patch(`/auctions/${auctionId}/close`);
}

async function getImages(auctionId: string): Promise<ImageDto[]> {
  const { data } = await httpClient.get<GetAuctionImagesResponse>(
    `/auctions/${auctionId}/images`
  );
  return data.data;
}

async function uploadImages(
  auctionId: string,
  files: File[],
  onUploadProgress?: (progress: number) => void
): Promise<ImageDto[]> {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const { data } = await httpClient.post<UploadImagesResponse>(
    `/auctions/${auctionId}/images`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(progress);
        }
      },
    }
  );
  return data.data;
}

async function deleteImage(auctionId: string, imageId: string): Promise<void> {
  await httpClient.delete(`/auctions/${auctionId}/images/${imageId}`);
}

async function reorderImages(
  auctionId: string,
  positions: ReorderImagesRequest
): Promise<void> {
  await httpClient.patch(`/auctions/${auctionId}/images/reorder`, positions);
}

export const auctionsService = {
  listOpen,
  getById,
  create,
  placeBid,
  close,
  getImages,
  uploadImages,
  deleteImage,
  reorderImages,
};
