import type { UserRole } from "#domain/entities/user";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface TokenService {
  sign: (payload: TokenPayload) => Promise<string>;
}
