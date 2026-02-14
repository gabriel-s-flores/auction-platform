import { AppError } from "#application/errors/app-error";
import type { Auction } from "#domain/entities/auction";
import type { AuctionRepository } from "#domain/repositories/auction-repository";

export class GetAuctionByIdUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) { }

  async execute(auctionId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findById(auctionId);

    if (!auction) {
      throw new AppError("Leilão não encontrado", 404);
    }

    return auction;
  }
}
