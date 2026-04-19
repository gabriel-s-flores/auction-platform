import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { UserRepository } from "#domain/repositories/user-repository";

interface DemoteAdminInput {
  actorId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

export class DemoteAdminUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: DemoteAdminInput): Promise<void> {
    const targetUser = await this.userRepository.findById(input.adminId);

    if (!targetUser) {
      throw new AppError("Administrador não encontrado", 404);
    }

    if (targetUser.role !== "ADMIN" && targetUser.role !== "SUPER_ADMIN") {
      throw new AppError("Usuário selecionado não possui privilégios administrativos", 409);
    }

    if (targetUser.id === input.actorId) {
      throw new AppError("Você não pode rebaixar sua própria conta", 400);
    }

    if (targetUser.role === "SUPER_ADMIN") {
      const superAdminCount = await this.userRepository.countByRole("SUPER_ADMIN");

      if (superAdminCount <= 1) {
        throw new AppError("Não é permitido rebaixar o último SUPER_ADMIN", 409);
      }
    }

    await this.userRepository.updateRole(targetUser.id, "USER");
    await this.auditService.log(
      "ADMIN_REMOVED",
      "user",
      targetUser.id,
      {
        email: targetUser.email,
        name: targetUser.name,
        previousRole: targetUser.role,
        newRole: "USER",
      },
      {
        actorId: input.actorId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );
  }
}