import { AppError } from "#application/errors/app-error";
import type { PasswordHasher } from "#application/services/password-hasher";
import type { User } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

interface AuthenticateUserInput {
  email: string;
  password: string;
}

export class AuthenticateUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) { }

  async execute(input: AuthenticateUserInput): Promise<User> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new AppError("Credenciais inválidas", 401);
    }

    const isValidPassword = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError("Credenciais inválidas", 401);
    }

    return user;
  }
}
