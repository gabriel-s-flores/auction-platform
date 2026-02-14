import { CreateAuctionUseCase } from "#application/use-cases/create-auction.use-case";
import { PrismaAuctionRepository } from "#infrastructure/repositories/prisma-auction.repository";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";
import { AppError } from "#application/errors/app-error";

export class CreateAuctionController {
  constructor(private readonly useCase: CreateAuctionUseCase) { }

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
