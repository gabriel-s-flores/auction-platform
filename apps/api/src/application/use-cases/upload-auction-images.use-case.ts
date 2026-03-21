import { AppError } from "#application/errors/app-error";
import { isAllowedMimeType, type StorageService, type UploadResult } from "#application/services/storage-service";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import type { CreateImageInput,ImageRepository } from "#domain/repositories/image-repository";

export interface UploadImageInput {
  auctionId: string;
  files: Array<{
    buffer: Buffer;
    filename: string;
    mimeType: string;
  }>;
  userId: string;
}

export interface UploadedImageOutput {
  id: string;
  url: string;
  thumbnailUrl: string;
  publicId: string | null;
  alt: string | null;
  position: number;
  isPrimary: boolean;
}

const MAX_IMAGES_PER_AUCTION = 10;

export class UploadAuctionImagesUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly auctionRepository: AuctionRepository,
    private readonly storageService: StorageService,
    private readonly maxSize: number
  ) {}

  async execute(input: UploadImageInput): Promise<UploadedImageOutput[]> {
    // Verify auction exists
    const auction = await this.auctionRepository.findById(input.auctionId);

    if (!auction) {
      throw new AppError("Leilão não encontrado", 404);
    }

    // Verify ownership
    if (auction.sellerId !== input.userId) {
      throw new AppError("Você não tem permissão para adicionar imagens a este leilão", 403);
    }

    // Check current image count
    const currentImages = await this.imageRepository.findByAuctionId(input.auctionId);
    if (currentImages.length + input.files.length > MAX_IMAGES_PER_AUCTION) {
      throw new AppError(
        `Máximo de ${MAX_IMAGES_PER_AUCTION} imagens por leilão excedido`,
        400
      );
    }

    // Validate files
    for (const file of input.files) {
      if (!isAllowedMimeType(file.mimeType)) {
        throw new AppError(
          `Tipo de arquivo não permitido: ${file.mimeType}. Use JPEG, PNG ou WebP`,
          400
        );
      }
      if (file.buffer.length > this.maxSize) {
        throw new AppError(
          `Arquivo muito grande: ${file.filename}. Tamanho máximo: ${Math.floor(this.maxSize / 1024 / 1024)}MB`,
          400
        );
      }
    }

    // Get next position
    const nextPosition = await this.imageRepository.getNextPosition(input.auctionId);

    // Upload files to storage
    const uploadResults: UploadResult[] = [];
    for (const file of input.files) {
      const result = await this.storageService.upload(
        file.buffer,
        file.filename,
        file.mimeType,
        `auctions/${input.auctionId}`
      );
      uploadResults.push(result);
    }

    // Create image records
    const imageInputs: CreateImageInput[] = uploadResults.map((result, index) => ({
      auctionId: input.auctionId,
      url: result.url,
      publicId: result.publicId,
      alt: null,
      position: nextPosition + index,
      isPrimary: nextPosition === 0 && index === 0, // First image is primary if it's the first upload
      mimeType: result.mimeType,
      size: result.size,
    }));

    const images = await this.imageRepository.createMany(imageInputs);

    return images.map(img => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: this.storageService.getThumbnailUrl(img.url, 200, 200),
      publicId: img.publicId,
      alt: img.alt,
      position: img.position,
      isPrimary: img.isPrimary,
    }));
  }
}
