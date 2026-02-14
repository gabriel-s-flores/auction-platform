import type { ListOpenAuctionsUseCase } from "@/application/use-cases/list-open-auctions.use-case";

export class ListOpenAuctionsController {
  constructor(private readonly useCase: ListOpenAuctionsUseCase) {}

  async handle() {
    return this.useCase.execute();
  }
}
