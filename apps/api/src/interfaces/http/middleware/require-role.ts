import type { FastifyRequest } from "fastify";

import { AppError } from "#application/errors/app-error";
import type { UserRole } from "#domain/entities/user";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

const ROLE_HIERARCHY: Record<UserRole, number> = {
 USER: 0,
 ADMIN: 1,
 SUPER_ADMIN: 2
};

export function requireRole(minRole: UserRole) {
 return async (request: FastifyRequest): Promise<void> => {
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new AppError("Não autenticado", 401);
    } else {
      const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
      const requiredLevel = ROLE_HIERARCHY[minRole];

      if (userLevel < requiredLevel) {
        throw new AppError("Acesso negado", 403);
      }
    }
 };
}

export function requireAuthenticated() {
  return async (request: FastifyRequest): Promise<void> => {
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      throw new AppError("Não autenticado", 401);
    }
  };
}

export function requireAdmin() {
 return requireRole("ADMIN");
}

export function requireSuperAdmin() {
 return requireRole("SUPER_ADMIN");
}
