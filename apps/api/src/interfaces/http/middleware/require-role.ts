import type { FastifyReply, FastifyRequest } from "fastify";

import type { UserRole } from "#domain/entities/user";
import type { AuthenticatedUser } from "#interfaces/http/types/authenticated-user";

const ROLE_HIERARCHY: Record<UserRole, number> = {
 USER: 0,
 ADMIN: 1,
 SUPER_ADMIN: 2
};

export function requireRole(minRole: UserRole) {
 return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as AuthenticatedUser | undefined;

    if (!user) {
      reply.status(401).send({ error: "Não autenticado" });
      return;
    }

    const userLevel = ROLE_HIERARCHY[user.role] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[minRole];

    if (userLevel < requiredLevel) {
      reply.status(403).send({ error: "Acesso negado" });
    }
 };
}

export function requireAdmin() {
 return requireRole("ADMIN");
}

export function requireSuperAdmin() {
 return requireRole("SUPER_ADMIN");
}
