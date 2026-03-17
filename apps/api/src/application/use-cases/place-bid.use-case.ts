import { AppError } from "#application/errors/app-error";
import type { Bid } from "#domain/entities/bid";
import type { AuctionRepository } from "#domain/repositories/auction-repository";

interface PlaceBidInput {
	auctionId: string;
	bidderId: string;
	amount: number;
}

export interface PlaceBidOutput {
	bid: Bid;
	auctionId: string;
	wasExtended: boolean;
	newEndsAt?: Date;
}

export class PlaceBidUseCase {
	constructor(private readonly auctionRepository: AuctionRepository) {}

	async execute(input: PlaceBidInput): Promise<PlaceBidOutput> {
		if (input.amount <= 0) {
			throw new AppError("Lance deve ser maior que zero", 400);
		}

		const result = await this.auctionRepository.placeBid({
			auctionId: input.auctionId,
			bidderId: input.bidderId,
			amount: input.amount
		});

		return {
			bid: result.bid,
			auctionId: input.auctionId,
			wasExtended: result.wasExtended,
			newEndsAt: result.wasExtended ? result.auction.endsAt : undefined
		};
	}
}
