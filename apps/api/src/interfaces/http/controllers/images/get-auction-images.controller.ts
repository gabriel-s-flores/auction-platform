import type { StorageService } from "#application/services/storage-service";
import type { ImageRepository } from "#domain/repositories/image-repository";

export interface ImageDto {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string | null;
  position: number;
  isPrimary: boolean;
}

export class GetAuctionImagesController {
  constructor(
    private readonly imageRepository: ImageRepository,
    private readonly storageService: StorageService
  ) {}

  async handle(auctionId: string): Promise<ImageDto[]> {
    const images = await this.imageRepository.findByAuctionId(auctionId);

    return images.map(img => ({
      id: img.id,
      url: img.url,
      thumbnailUrl: this.storageService.getThumbnailUrl(img.url, 64, 64),
      alt: img.alt,
      position: img.position,
      isPrimary: img.isPrimary,
    }));
  }
}
