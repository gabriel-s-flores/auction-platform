import type { UserRole } from "@/domain/entities/user";

export interface AuthenticatedUser {
  sub: string;
  email: string;
  role: UserRole;
}
