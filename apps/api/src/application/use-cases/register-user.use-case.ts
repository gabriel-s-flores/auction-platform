import { AppError } from "@/application/errors/app-error";
import type { PasswordHasher } from "@/application/services/password-hasher";
import type { User } from "@/domain/entities/user";
import type { UserRepository } from "@/domain/repositories/user-repository";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new AppError("E-mail já cadastrado", 409);
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    return this.userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash
    });
  }
}
