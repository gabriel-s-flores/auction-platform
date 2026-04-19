import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { UserRepository } from "#domain/repositories/user-repository";

interface PromoteUserInput {
  actorId: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class PromoteUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: PromoteUserInput): Promise<void> {
    const targetUser = await this.userRepository.findById(input.userId);

    if (!targetUser) {
      throw new AppError("Usuário não encontrado", 404);
    }

    if (targetUser.role !== "USER") {
      throw new AppError("Apenas usuários comuns podem ser promovidos a admin", 409);
    }

    if (targetUser.isBanned) {
      throw new AppError("Não é possível promover um usuário banido", 409);
    }

    await this.userRepository.updateRole(targetUser.id, "ADMIN");
    await this.auditService.log(
      "ADMIN_CREATED",
      "user",
      targetUser.id,
      {
        email: targetUser.email,
        name: targetUser.name,
        previousRole: targetUser.role,
        newRole: "ADMIN",
      },
      {
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );
  }
}