import type { UploadAuctionImagesUseCase } from "#application/use-cases/upload-auction-images.use-case";

export class UploadAuctionImagesController {
  constructor(private readonly useCase: UploadAuctionImagesUseCase) {}

  async handle(input: {
    auctionId: string;
    files: Array<{
      buffer: Buffer;
      filename: string;
      mimeType: string;
    }>;
    userId: string;
  }) {
    return this.useCase.execute(input);
  }
}
