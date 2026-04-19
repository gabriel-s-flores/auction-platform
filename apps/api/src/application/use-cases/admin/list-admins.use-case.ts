import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

export interface AdminOutput {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export class ListAdminsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(): Promise<AdminOutput[]> {
    const admins = await this.userRepository.listAdmins();

    return admins.map((admin) => ({
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      createdAt: admin.createdAt.toISOString(),
      lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    }));
  }
}