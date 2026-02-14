import type { Auction } from "#domain/entities/auction";
import type { AuctionRepository } from "#domain/repositories/auction-repository";

export class ListOpenAuctionsUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) { }

  async execute(): Promise<Auction[]> {
    return this.auctionRepository.listOpenAuctions();
  }
}

