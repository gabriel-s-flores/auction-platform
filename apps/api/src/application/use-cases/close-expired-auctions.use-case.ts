import type { AuctionRepository } from "#domain/repositories/auction-repository";

export interface CloseExpiredAuctionsOutput {
  closedAuctionIds: string[];
  closedCount: number;
  processedAt: string;
}

export class CloseExpiredAuctionsUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) {}

  async execute(now = new Date()): Promise<CloseExpiredAuctionsOutput> {
    const closedAuctionIds = await this.auctionRepository.closeExpiredAuctions(now);

    return {
      closedAuctionIds,
      closedCount: closedAuctionIds.length,
      processedAt: now.toISOString(),
    };
  }
}