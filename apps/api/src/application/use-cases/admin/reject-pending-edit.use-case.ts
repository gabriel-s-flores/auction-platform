import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { PendingEditRepository } from "#domain/repositories/pending-edit-repository";

interface RejectPendingEditInput {
  editId: string;
  adminId: string;
  reason: string;
  ipAddress?: string;
  userAgent?: string;
}

export class RejectPendingEditUseCase {
  constructor(
    private readonly pendingEditRepository: PendingEditRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: RejectPendingEditInput): Promise<void> {
    const edit = await this.pendingEditRepository.findById(input.editId);

    if (!edit) {
      throw new AppError("Edição pendente não encontrada", 404);
    }

    if (edit.status !== "PENDING_APPROVAL") {
      throw new AppError("Edição não está pendente de aprovação", 409);
    }

    if (!input.reason.trim() || input.reason.trim().length < 5) {
      throw new AppError("Motivo da rejeição é obrigatório (mínimo 5 caracteres)", 400);
    }

    await this.pendingEditRepository.reject(edit.id, input.adminId, input.reason);
    await this.auditService.log(
      "EDIT_REJECTED",
      "pending_edit",
      edit.id,
      {
        auctionId: edit.auctionId,
        editType: edit.editType,
        reason: input.reason,
      },
      {
        actorId: input.adminId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );
  }
}