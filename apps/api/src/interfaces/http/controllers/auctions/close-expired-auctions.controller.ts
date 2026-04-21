import type { CloseExpiredAuctionsUseCase } from "#application/use-cases/close-expired-auctions.use-case";

export class CloseExpiredAuctionsController {
  constructor(private readonly useCase: CloseExpiredAuctionsUseCase) {}

  async handle() {
    return this.useCase.execute();
  }
}