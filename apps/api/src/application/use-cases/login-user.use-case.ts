import type { TokenService } from "#application/services/token-service";
import type { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";

interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
}

export class LoginUserUseCase {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly tokenService: TokenService
  ) { }

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.authenticateUserUseCase.execute({
      email: input.email,
      password: input.password
    });

    const accessToken = await this.tokenService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return { accessToken };
  }
}
