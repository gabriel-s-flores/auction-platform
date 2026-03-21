import type { ReorderAuctionImagesUseCase } from "#application/use-cases/reorder-auction-images.use-case";

export class ReorderAuctionImagesController {
  constructor(private readonly useCase: ReorderAuctionImagesUseCase) {}

  async handle(input: {
    auctionId: string;
    userId: string;
    positions: Array<{
      id: string;
      position: number;
      isPrimary: boolean;
    }>;
  }): Promise<void> {
    await this.useCase.execute(input);
  }
}
