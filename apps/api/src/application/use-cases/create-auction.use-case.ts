import { AppError } from "#application/errors/app-error";
import type { Auction } from "#domain/entities/auction";
import type { AuctionRepository } from "#domain/repositories/auction-repository";

interface CreateAuctionInput {
  title: string;
  description: string | null;
  startingPrice: number;
  endsAt: Date;
  sellerId: string;
}

export class CreateAuctionUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) { }

  async execute(input: CreateAuctionInput): Promise<Auction> {
    if (input.startingPrice <= 0) {
      throw new AppError("Preço inicial deve ser maior que zero", 400);
    }

    if (input.endsAt.getTime() <= Date.now()) {
      throw new AppError("Data de encerramento deve estar no futuro", 400);
    }

    return this.auctionRepository.create({
      title: input.title,
      description: input.description,
      startingPrice: input.startingPrice,
      endsAt: input.endsAt,
      sellerId: input.sellerId
    });
  }
}
