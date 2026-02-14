import type { PlaceBidUseCase } from "@/application/use-cases/place-bid.use-case";

export class PlaceBidController {
  constructor(private readonly useCase: PlaceBidUseCase) {}

  async handle(input: { auctionId: string; bidderId: string; amount: number }) {
    return this.useCase.execute(input);
  }
}
