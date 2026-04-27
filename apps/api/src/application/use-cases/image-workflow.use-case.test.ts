import { describe, expect, test } from "bun:test";

import { AppError } from "#application/errors/app-error";
import type { StorageService, UploadResult } from "#application/services/storage-service";
import { DeleteAuctionImageUseCase } from "#application/use-cases/delete-auction-image.use-case";
import { ReorderAuctionImagesUseCase } from "#application/use-cases/reorder-auction-images.use-case";
import { UploadAuctionImagesUseCase } from "#application/use-cases/upload-auction-images.use-case";
import type { Auction } from "#domain/entities/auction";
import type { Image } from "#domain/entities/image";
import type {
  AuctionRepository,
  CloseAuctionResult,
  PlaceBidResult,
  UserAuctionListItem,
  UserBidActivitySummary,
  UserDashboardSummary,
  UserWinSummary,
} from "#domain/repositories/auction-repository";
import type { CreateImageInput, ImageRepository } from "#domain/repositories/image-repository";

function makeAuction(overrides: Partial<Auction> = {}): Auction {
  const now = new Date("2026-01-01T00:00:00.000Z");

  return {
    id: "auction-1",
    title: "Auction",
    description: null,
    startingPrice: 100,
    highestBid: 100,
    status: "OPEN",
    endsAt: new Date("2026-02-01T00:00:00.000Z"),
    version: 0,
    rejectionReason: null,
    approvedById: null,
    approvedAt: null,
    sellerId: "seller-1",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function makeImage(overrides: Partial<Image> = {}): Image {
  return {
    id: "image-1",
    auctionId: "auction-1",
    url: "https://res.cloudinary.com/demo/image/upload/v1/image.jpg",
    publicId: "image-public-id",
    alt: null,
    position: 0,
    isPrimary: true,
    mimeType: "image/jpeg",
    size: 100,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

async function notImplemented(): Promise<never> {
  throw new Error("not implemented");
}

async function expectAppError(
  action: () => Promise<unknown>,
  statusCode: number,
  message: string
): Promise<void> {
  try {
    await action();
    throw new Error("expected action to throw");
  } catch (error) {
    expect(error).toBeInstanceOf(AppError);
    expect((error as AppError).statusCode).toBe(statusCode);
    expect((error as Error).message).toBe(message);
  }
}

class FakeAuctionRepository implements AuctionRepository {
  auction: Auction | null = makeAuction();

  async listOpenAuctions(): Promise<Auction[]> {
    return notImplemented();
  }

  async findById(): Promise<Auction | null> {
    return this.auction;
  }

  async create(): Promise<Auction> {
    return notImplemented();
  }

  async getUserDashboardSummary(): Promise<UserDashboardSummary> {
    return notImplemented();
  }

  async listBySeller(): Promise<{ data: UserAuctionListItem[]; total: number }> {
    return notImplemented();
  }

  async listWinsByBidder(): Promise<{ data: UserWinSummary[]; total: number }> {
    return notImplemented();
  }

  async listBidActivityByUser(): Promise<{ data: UserBidActivitySummary[]; total: number }> {
    return notImplemented();
  }

  async close(): Promise<CloseAuctionResult> {
    return notImplemented();
  }

  async closeExpiredAuctions(): Promise<string[]> {
    return notImplemented();
  }

  async placeBid(): Promise<PlaceBidResult> {
    return notImplemented();
  }
}

class FakeImageRepository implements ImageRepository {
  createdInputs: CreateImageInput[] = [];
  deletedImageIds: string[] = [];
  images: Image[] = [];
  nextPosition = 0;
  updatedPositions: Array<{ id: string; position: number; isPrimary: boolean }[]> = [];

  async findByAuctionId(): Promise<Image[]> {
    return this.images;
  }

  async findById(imageId: string): Promise<Image | null> {
    return this.images.find((image) => image.id === imageId) ?? null;
  }

  async create(input: CreateImageInput): Promise<Image> {
    this.createdInputs.push(input);

    return makeImage(input);
  }

  async createMany(inputs: CreateImageInput[]): Promise<Image[]> {
    this.createdInputs.push(...inputs);

    return inputs.map((input, index) => makeImage({ id: `created-${index}`, ...input }));
  }

  async delete(imageId: string): Promise<void> {
    this.deletedImageIds.push(imageId);
    this.images = this.images.filter((image) => image.id !== imageId);
  }

  async deleteByAuctionId(): Promise<void> {
    return notImplemented();
  }

  async updatePositions(
    positions: { id: string; position: number; isPrimary: boolean }[]
  ): Promise<void> {
    this.updatedPositions.push(positions);
  }

  async getNextPosition(): Promise<number> {
    return this.nextPosition;
  }
}

class FakeStorageService implements StorageService {
  deletedPublicIds: string[] = [];
  uploadedFiles: Array<{ filename: string; folder?: string; mimeType: string }> = [];

  async upload(
    _file: Buffer,
    filename: string,
    mimeType: string,
    folder?: string
  ): Promise<UploadResult> {
    this.uploadedFiles.push({ filename, folder, mimeType });

    return {
      url: `https://res.cloudinary.com/demo/image/upload/v1/${filename}`,
      publicId: `public/${filename}`,
      mimeType,
      size: 123,
    };
  }

  async delete(publicId: string): Promise<void> {
    this.deletedPublicIds.push(publicId);
  }

  getThumbnailUrl(url: string, width: number, height: number): string {
    return `${url}?w=${width}&h=${height}`;
  }

  getThumbnailByPreset(url: string): string {
    return `${url}?preset=card`;
  }

  getResponsiveUrls(url: string) {
    return {
      original: url,
      thumbnail: `${url}?thumbnail=true`,
    };
  }
}

function makeUseCases() {
  const auctionRepository = new FakeAuctionRepository();
  const imageRepository = new FakeImageRepository();
  const storageService = new FakeStorageService();

  return {
    auctionRepository,
    deleteUseCase: new DeleteAuctionImageUseCase(
      imageRepository,
      auctionRepository,
      storageService
    ),
    imageRepository,
    reorderUseCase: new ReorderAuctionImagesUseCase(imageRepository, auctionRepository),
    storageService,
    uploadUseCase: new UploadAuctionImagesUseCase(
      imageRepository,
      auctionRepository,
      storageService,
      1024
    ),
  };
}

describe("image workflow use cases", () => {
  test("uploads valid images, stores positions, and marks the first image as primary", async () => {
    const { imageRepository, storageService, uploadUseCase } = makeUseCases();
    imageRepository.nextPosition = 0;

    const result = await uploadUseCase.execute({
      auctionId: "auction-1",
      userId: "seller-1",
      files: [
        {
          buffer: Buffer.from("image-a"),
          filename: "a.jpg",
          mimeType: "image/jpeg",
        },
        {
          buffer: Buffer.from("image-b"),
          filename: "b.png",
          mimeType: "image/png",
        },
      ],
    });

    expect(storageService.uploadedFiles).toEqual([
      { filename: "a.jpg", folder: "auctions/auction-1", mimeType: "image/jpeg" },
      { filename: "b.png", folder: "auctions/auction-1", mimeType: "image/png" },
    ]);
    expect(imageRepository.createdInputs.map((input) => input.position)).toEqual([0, 1]);
    expect(imageRepository.createdInputs.map((input) => input.isPrimary)).toEqual([true, false]);
    expect(result[0]?.thumbnailUrl).toContain("preset=card");
  });

  test("rejects disallowed MIME types before uploading", async () => {
    const { storageService, uploadUseCase } = makeUseCases();

    await expectAppError(
      () =>
        uploadUseCase.execute({
          auctionId: "auction-1",
          userId: "seller-1",
          files: [
            {
              buffer: Buffer.from("gif"),
              filename: "a.gif",
              mimeType: "image/gif",
            },
          ],
        }),
      400,
      "Tipo de arquivo não permitido: image/gif. Use JPEG, PNG ou WebP"
    );
    expect(storageService.uploadedFiles).toEqual([]);
  });

  test("enforces the maximum image count per auction", async () => {
    const { imageRepository, uploadUseCase } = makeUseCases();
    imageRepository.images = Array.from({ length: 10 }, (_, index) =>
      makeImage({ id: `image-${index}`, position: index, isPrimary: index === 0 })
    );

    await expectAppError(
      () =>
        uploadUseCase.execute({
          auctionId: "auction-1",
          userId: "seller-1",
          files: [
            {
              buffer: Buffer.from("image"),
              filename: "extra.jpg",
              mimeType: "image/jpeg",
            },
          ],
        }),
      400,
      "Máximo de 10 imagens por leilão excedido"
    );
  });

  test("requires exactly one primary image when reordering", async () => {
    const { imageRepository, reorderUseCase } = makeUseCases();
    imageRepository.images = [
      makeImage({ id: "image-1", isPrimary: true }),
      makeImage({ id: "image-2", position: 1, isPrimary: false }),
    ];

    await expectAppError(
      () =>
        reorderUseCase.execute({
          auctionId: "auction-1",
          userId: "seller-1",
          positions: [
            { id: "image-1", position: 1, isPrimary: false },
            { id: "image-2", position: 0, isPrimary: false },
          ],
        }),
      400,
      "Deve haver exatamente uma imagem principal"
    );
  });

  test("persists valid reorder positions", async () => {
    const { imageRepository, reorderUseCase } = makeUseCases();
    imageRepository.images = [
      makeImage({ id: "image-1", isPrimary: true }),
      makeImage({ id: "image-2", position: 1, isPrimary: false }),
    ];

    await reorderUseCase.execute({
      auctionId: "auction-1",
      userId: "seller-1",
      positions: [
        { id: "image-1", position: 1, isPrimary: false },
        { id: "image-2", position: 0, isPrimary: true },
      ],
    });

    expect(imageRepository.updatedPositions).toEqual([
      [
        { id: "image-1", position: 1, isPrimary: false },
        { id: "image-2", position: 0, isPrimary: true },
      ],
    ]);
  });

  test("deletes storage assets and promotes the next image when deleting the primary image", async () => {
    const { deleteUseCase, imageRepository, storageService } = makeUseCases();
    imageRepository.images = [
      makeImage({ id: "image-1", isPrimary: true, publicId: "primary-public-id" }),
      makeImage({ id: "image-2", position: 1, isPrimary: false, publicId: "secondary-public-id" }),
    ];

    await deleteUseCase.execute({
      auctionId: "auction-1",
      imageId: "image-1",
      userId: "seller-1",
    });

    expect(storageService.deletedPublicIds).toEqual(["primary-public-id"]);
    expect(imageRepository.deletedImageIds).toEqual(["image-1"]);
    expect(imageRepository.updatedPositions).toEqual([
      [{ id: "image-2", position: 1, isPrimary: true }],
    ]);
  });
});
