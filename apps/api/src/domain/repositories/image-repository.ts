import type { Image } from "#domain/entities/image";

export interface CreateImageInput {
  auctionId: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  position: number;
  isPrimary: boolean;
  mimeType: string;
  size: number;
}

export interface UploadedImage {
  id: string;
  auctionId: string;
  url: string;
  publicId: string | null;
  alt: string | null;
  position: number;
  isPrimary: boolean;
}

export interface ImageRepository {
  findByAuctionId: (auctionId: string) => Promise<Image[]>;
  findById: (imageId: string) => Promise<Image | null>;
  create: (input: CreateImageInput) => Promise<Image>;
  createMany: (inputs: CreateImageInput[]) => Promise<Image[]>;
  delete: (imageId: string) => Promise<void>;
  deleteByAuctionId: (auctionId: string) => Promise<void>;
  updatePositions: (positions: { id: string; position: number; isPrimary: boolean }[]) => Promise<void>;
  getNextPosition: (auctionId: string) => Promise<number>;
}
