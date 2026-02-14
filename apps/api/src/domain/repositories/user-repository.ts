import type { User } from "@/domain/entities/user";

export interface CreateUserInput {
  name: string;
  email: string;
  passwordHash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(userId: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
}
