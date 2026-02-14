import { AppError } from "@/application/errors/app-error";
import type { AuctionRepository } from "@/domain/repositories/auction-repository";

interface CloseAuctionInput {
  auctionId: string;
  userId: string;
  isAdmin: boolean;
}

export class CloseAuctionUseCase {
  constructor(private readonly auctionRepository: AuctionRepository) {}

  async execute(input: CloseAuctionInput): Promise<void> {
    const result = await this.auctionRepository.close(input.auctionId, input.userId, input.isAdmin);

    if (result === "NOT_FOUND") {
      throw new AppError("Leilão não encontrado", 404);
    }

    if (result === "FORBIDDEN") {
      throw new AppError("Sem permissão para encerrar este leilão", 403);
    }

    if (result === "ALREADY_CLOSED") {
      throw new AppError("Leilão já está encerrado", 409);
    }
  }
}
