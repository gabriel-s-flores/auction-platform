import { AppError } from "#application/errors/app-error";
import type { UserRole } from "#domain/entities/user";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import type { UserRepository } from "#domain/repositories/user-repository";

export interface UserDashboardProfileOutput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserDashboardSummaryOutput {
  profile: UserDashboardProfileOutput;
  totalAuctions: number;
  activeAuctions: number;
  pendingAuctions: number;
  closedAuctions: number;
  rejectedAuctions: number;
  wonAuctions: number;
  activeBidParticipations: number;
}

export class GetUserDashboardSummaryUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auctionRepository: AuctionRepository
  ) {}

  async execute(userId: string): Promise<UserDashboardSummaryOutput> {
    const [user, summary] = await Promise.all([
      this.userRepository.findById(userId),
      this.auctionRepository.getUserDashboardSummary(userId),
    ]);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
      },
      ...summary,
    };
  }
}