import type { CreateAuctionUseCase } from "@/application/use-cases/create-auction.use-case";

export class CreateAuctionController {
  constructor(private readonly useCase: CreateAuctionUseCase) {}

  async handle(input: {
    title: string;
    description: string | null;
    startingPrice: number;
    endsAt: string;
    sellerId: string;
  }) {
    const auction = await this.useCase.execute({
      title: input.title,
      description: input.description,
      startingPrice: input.startingPrice,
      endsAt: new Date(input.endsAt),
      sellerId: input.sellerId
    });

    return auction;
  }
}
