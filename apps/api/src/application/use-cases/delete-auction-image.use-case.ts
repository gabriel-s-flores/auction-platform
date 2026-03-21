import { AppError } from "#application/errors/app-error";
import type { StorageService } from "#application/services/storage-service";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import type { ImageRepository } from "#domain/repositories/image-repository";

export interface DeleteImageInput {
  auctionId: string;
  imageId: string;
  userId: string;
}

export class DeleteAuctionImageUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly auctionRepository: AuctionRepository,
    private readonly storageService: StorageService
  ) {}

  async execute(input: DeleteImageInput): Promise<void> {
    // Verify auction exists
    const auction = await this.auctionRepository.findById(input.auctionId);

    if (!auction) {
      throw new AppError("Leilão não encontrado", 404);
    }

    // Verify ownership
    if (auction.sellerId !== input.userId) {
      throw new AppError("Você não tem permissão para remover imagens deste leilão", 403);
    }

    // Find image
    const image = await this.imageRepository.findById(input.imageId);

    if (!image || image.auctionId !== input.auctionId) {
      throw new AppError("Imagem não encontrada", 404);
    }

    // Delete from storage
    if (image.publicId) {
      await this.storageService.delete(image.publicId);
    }

    // Delete from database
    await this.imageRepository.delete(input.imageId);

    // If the deleted image was primary, set the next one as primary
    if (image.isPrimary) {
      const remainingImages = await this.imageRepository.findByAuctionId(input.auctionId);
      const firstImage = remainingImages[0];
      if (firstImage) {
        await this.imageRepository.updatePositions([
          { id: firstImage.id, position: firstImage.position, isPrimary: true },
        ]);
      }
    }
  }
}
