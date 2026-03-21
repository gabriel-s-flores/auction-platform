import { AppError } from "#application/errors/app-error";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import type { ImageRepository } from "#domain/repositories/image-repository";

export interface ReorderImageInput {
  auctionId: string;
  userId: string;
  positions: Array<{
    id: string;
    position: number;
    isPrimary: boolean;
  }>;
}

export class ReorderAuctionImagesUseCase {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly auctionRepository: AuctionRepository
  ) {}

  async execute(input: ReorderImageInput): Promise<void> {
    // Verify auction exists
    const auction = await this.auctionRepository.findById(input.auctionId);

    if (!auction) {
      throw new AppError("Leilão não encontrado", 404);
    }

    // Verify ownership
    if (auction.sellerId !== input.userId) {
      throw new AppError("Você não tem permissão para reordenar imagens deste leilão", 403);
    }

    // Verify all images belong to the auction
    const existingImages = await this.imageRepository.findByAuctionId(input.auctionId);
    const existingIds = new Set(existingImages.map(img => img.id));

    for (const pos of input.positions) {
      if (!existingIds.has(pos.id)) {
        throw new AppError(`Imagem ${pos.id} não pertence a este leilão`, 400);
      }
    }

    // Ensure exactly one primary image
    const primaryCount = input.positions.filter(p => p.isPrimary).length;
    if (input.positions.length > 0 && primaryCount !== 1) {
      throw new AppError("Deve haver exatamente uma imagem principal", 400);
    }

    // Update positions
    await this.imageRepository.updatePositions(input.positions);
  }
}
