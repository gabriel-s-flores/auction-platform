import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

interface BanUserInput {
  actorId: string;
  actorRole: UserRole;
  userId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

function assertCanManageUser(actorId: string, actorRole: UserRole, targetUser: { id: string; role: UserRole }) {
  if (actorId === targetUser.id) {
    throw new AppError("Você não pode banir sua própria conta", 400);
  }

  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError("Não é permitido banir um super admin", 403);
  }

  if (actorRole === "ADMIN" && targetUser.role !== "USER") {
    throw new AppError("Admins só podem banir usuários comuns", 403);
  }
}

export class BanUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: BanUserInput): Promise<void> {
    const targetUser = await this.userRepository.findById(input.userId);

    if (!targetUser) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (targetUser.isBanned) {
      throw new AppError("Usuário já está banido", 409);
    }

    if (input.reason.trim().length < 5) {
      throw new AppError("Motivo do banimento é obrigatório (mínimo 5 caracteres)", 400);
    }

    assertCanManageUser(input.actorId, input.actorRole, targetUser);

    await this.userRepository.updateBanStatus(targetUser.id, true);
    await this.auditService.log(
      "USER_BANNED",
      "user",
      targetUser.id,
      {
        email: targetUser.email,
        name: targetUser.name,
        reason: input.reason,
        role: targetUser.role,
      },
      {
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );
  }
}