import type { User } from "@/domain/entities/user";
import type { CreateUserInput, UserRepository } from "@/domain/repositories/user-repository";
import { prisma } from "@/infrastructure/database/prisma-client";

function mapUser(model: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "USER" | "ADMIN";
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: model.id,
    name: model.name,
    email: model.email,
    passwordHash: model.passwordHash,
    role: model.role,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt
  };
}

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    return user ? mapUser(user) : null;
  }

  async findById(userId: string): Promise<User | null> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    return user ? mapUser(user) : null;
  }

  async create(input: CreateUserInput): Promise<User> {
    const user = await prisma.user.create({ data: input });
    return mapUser(user);
  }
}
