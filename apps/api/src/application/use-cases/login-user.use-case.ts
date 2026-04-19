import type { TokenService } from "#application/services/token-service";
import type { AuthenticateUserUseCase } from "#application/use-cases/authenticate-user.use-case";
import type { UserRole } from "#domain/entities/user";

interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export class LoginUserUseCase {
  constructor(
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.authenticateUserUseCase.execute({
      email: input.email,
      password: input.password,
    });

    const accessToken = await this.tokenService.signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    const refreshToken = await this.tokenService.signRefreshToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }
}