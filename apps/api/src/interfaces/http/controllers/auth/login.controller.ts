import type { LoginUserUseCase } from "@/application/use-cases/login-user.use-case";

export class LoginController {
  constructor(private readonly useCase: LoginUserUseCase) {}

  async handle(input: { email: string; password: string }) {
    return this.useCase.execute(input);
  }
}
