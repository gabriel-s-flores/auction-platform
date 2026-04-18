import type { UserRole } from "#domain/entities/user";

export interface TokenPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface TokenService {
  signAccessToken: (payload: TokenPayload) => Promise<string>;
  signRefreshToken: (payload: TokenPayload) => Promise<string>;
}