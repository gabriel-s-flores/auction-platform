import { RegisterUserUseCase } from "#application/use-cases/register-user.use-case";
import { BunPasswordHasher } from "#infrastructure/security/bun-password-hasher";
import { PrismaUserRepository } from "#infrastructure/repositories/prisma-user.repository";
import { AppError } from "#application/errors/app-error";

export class RegisterController {
  constructor(private readonly useCase: RegisterUserUseCase) { }

  async handle(input: { name: string; email: string; password: string }) {
    const user = await this.useCase.execute(input);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };
  }
}
