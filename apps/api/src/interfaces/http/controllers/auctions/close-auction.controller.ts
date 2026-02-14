import type { CloseAuctionUseCase } from "#application/use-cases/close-auction.use-case";

export class CloseAuctionController {
  constructor(private readonly useCase: CloseAuctionUseCase) { }

  async handle(input: { auctionId: string; userId: string; isAdmin: boolean }): Promise<void> {
    await this.useCase.execute(input);
  }
}
