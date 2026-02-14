import { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";
import { LoginUserUseCase } from "#application/use-cases/login-user.use-case";
import { BunPasswordHasher } from "#infrastructure/security/bun-password-hasher";
import { PrismaUserRepository } from "#infrastructure/repositories/prisma-user.repository";
import { FastifyTokenService } from "#infrastructure/security/fastify-token-service";

export class LoginController {
  constructor(private readonly useCase: LoginUserUseCase) { }

  async handle(input: { email: string; password: string }) {
    return this.useCase.execute(input);
  }
}
