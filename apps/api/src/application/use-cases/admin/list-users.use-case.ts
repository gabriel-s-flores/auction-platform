import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

export interface ListUsersInput {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBanned?: boolean;
}

export interface UserOutput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersOutput {
  data: UserOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUsersUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.userRepository.list({
      page,
      limit,
      search: input.search,
      role: input.role,
      isBanned: input.isBanned,
    });

    return {
      data: result.data.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isBanned: user.isBanned,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}