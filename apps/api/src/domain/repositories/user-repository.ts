import type { User, UserRole } from "#domain/entities/user";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  isBanned?: boolean;
}

export interface ListUsersInput {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBanned?: boolean;
}

export interface UserDetail extends User {
  auctionsCount: number;
  bidsCount: number;
  wonAuctionsCount: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  lastLoginAt: Date | null;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  list(input: ListUsersInput): Promise<{ data: User[]; total: number }>;
  listAdmins(): Promise<AdminUser[]>;
  countByRole(role: UserRole): Promise<number>;
  getDetail(userId: string): Promise<UserDetail | null>;
  updateBanStatus(userId: string, isBanned: boolean): Promise<User | null>;
  updateRole(userId: string, role: UserRole): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
