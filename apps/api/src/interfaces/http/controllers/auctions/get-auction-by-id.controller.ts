import type { GetAuctionByIdUseCase } from "#application/use-cases/get-auction-by-id.use-case";

export class GetAuctionByIdController {
  constructor(private readonly useCase: GetAuctionByIdUseCase) { }

  async handle(auctionId: string) {
    return this.useCase.execute(auctionId);
  }
}
