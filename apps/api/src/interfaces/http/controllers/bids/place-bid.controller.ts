import type { PlaceBidUseCase } from "#application/use-cases/place-bid.use-case";
import { emitAuctionExtended, emitNewBid } from "#infrastructure/websocket/auction-events";

export class PlaceBidController {
	constructor(private readonly useCase: PlaceBidUseCase) {}

	async handle(input: { auctionId: string; bidderId: string; amount: number }) {
		const result = await this.useCase.execute(input);

		// Emit new bid event to all watchers
		emitNewBid({
			auctionId: result.auctionId,
			bidId: result.bid.id,
			amount: result.bid.amount,
			bidderId: result.bid.bidderId,
			createdAt: result.bid.createdAt.toISOString()
		});

		// If auction was extended due to anti-sniping, emit extension event
		if (result.wasExtended && result.newEndsAt) {
			emitAuctionExtended({
				auctionId: result.auctionId,
				newEndsAt: result.newEndsAt.toISOString(),
				wasExtended: true
			});
		}

		return result;
	}
}
