import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { UserRole } from "#domain/entities/user";
import type { UserRepository } from "#domain/repositories/user-repository";

interface UnbanUserInput {
  actorId: string;
  actorRole: UserRole;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

function assertCanManageUser(actorId: string, actorRole: UserRole, targetUser: { id: string; role: UserRole }) {
  if (actorId === targetUser.id) {
    throw new AppError("Você não pode desbanir sua própria conta", 400);
  }

  if (targetUser.role === "SUPER_ADMIN") {
    throw new AppError("Não é permitido desbanir um super admin por esta operação", 403);
  }

  if (actorRole === "ADMIN" && targetUser.role !== "USER") {
    throw new AppError("Admins só podem desbanir usuários comuns", 403);
  }
}

export class UnbanUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: UnbanUserInput): Promise<void> {
    const targetUser = await this.userRepository.findById(input.userId);

    if (!targetUser) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (!targetUser.isBanned) {
      throw new AppError("Usuário não está banido", 409);
    }

    assertCanManageUser(input.actorId, input.actorRole, targetUser);

    await this.userRepository.updateBanStatus(targetUser.id, false);
    await this.auditService.log(
      "USER_UNBANNED",
      "user",
      targetUser.id,
      {
        email: targetUser.email,
        name: targetUser.name,
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