import type { DeleteAuctionImageUseCase } from "#application/use-cases/delete-auction-image.use-case";

export class DeleteAuctionImageController {
  constructor(private readonly useCase: DeleteAuctionImageUseCase) {}

  async handle(input: {
    auctionId: string;
    imageId: string;
    userId: string;
  }): Promise<void> {
    await this.useCase.execute(input);
  }
}
