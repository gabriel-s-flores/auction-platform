import { AppError } from "#application/errors/app-error";
import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

export interface UserDetailOutput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
  auctionsCount: number;
  bidsCount: number;
  wonAuctionsCount: number;
}

export class GetUserDetailUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<UserDetailOutput> {
    const user = await this.userRepository.getDetail(userId);

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBanned: user.isBanned,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      auctionsCount: user.auctionsCount,
      bidsCount: user.bidsCount,
      wonAuctionsCount: user.wonAuctionsCount,
    };
  }
}