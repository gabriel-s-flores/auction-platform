import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { EditType } from "#domain/entities/pending-auction-edit";
import type { AuctionRepository } from "#domain/repositories/auction-repository";
import type { PendingEditRepository } from "#domain/repositories/pending-edit-repository";

interface SubmitAuctionEditInput {
  auctionId: string;
  submittedById: string;
  editType: EditType;
  title?: string;
  description?: string | null;
  ipAddress?: string;
  userAgent?: string;
}

export interface SubmitAuctionEditOutput {
  id: string;
  auctionId: string;
  editType: EditType;
  status: "PENDING_APPROVAL";
  createdAt: string;
}

function normalizeDescription(description?: string | null) {
  if (typeof description !== "string") {
    return null;
  }

  const trimmedDescription = description.trim();

  return trimmedDescription.length === 0 ? null : trimmedDescription;
}

export class SubmitAuctionEditUseCase {
  constructor(
    private readonly auctionRepository: AuctionRepository,
    private readonly pendingEditRepository: PendingEditRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: SubmitAuctionEditInput): Promise<SubmitAuctionEditOutput> {
    const auction = await this.auctionRepository.findById(input.auctionId);

    if (!auction) {
      throw new AppError("Leilão não encontrado", 404);
    }

    if (auction.sellerId !== input.submittedById) {
      throw new AppError("Você não tem permissão para editar este leilão", 403);
    }

    if (auction.status === "CLOSED") {
      throw new AppError("Leilões encerrados não podem receber edições", 409);
    }

    const pendingEdits = await this.pendingEditRepository.list({
      auctionId: input.auctionId,
      status: "PENDING_APPROVAL",
      page: 1,
      limit: 50,
    });

    if (pendingEdits.data.some((edit) => edit.editType === input.editType)) {
      throw new AppError("Já existe uma edição pendente deste tipo para este leilão", 409);
    }

    let oldValue: Record<string, unknown> | null;
    let newValue: Record<string, unknown>;

    if (input.editType === "TITLE") {
      const title = input.title?.trim();

      if (!title || title.length < 3) {
        throw new AppError("Novo título inválido", 400);
      }

      if (title === auction.title) {
        throw new AppError("O novo título deve ser diferente do atual", 400);
      }

      oldValue = { title: auction.title };
      newValue = { title };
    } else if (input.editType === "DESCRIPTION") {
      const description = normalizeDescription(input.description);
      const currentDescription = normalizeDescription(auction.description);

      if (description === currentDescription) {
        throw new AppError("A nova descrição deve ser diferente da atual", 400);
      }

      oldValue = { description: auction.description };
      newValue = { description };
    } else {
      throw new AppError("Tipo de edição não suportado para submissão", 400);
    }

    const edit = await this.pendingEditRepository.create({
      auctionId: input.auctionId,
      editType: input.editType,
      oldValue,
      newValue,
      submittedById: input.submittedById,
    });

    await this.auditService.log(
      "EDIT_SUBMITTED",
      "pending_edit",
      edit.id,
      {
        auctionId: input.auctionId,
        editType: input.editType,
      },
      {
        actorId: input.submittedById,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );

    return {
      id: edit.id,
      auctionId: edit.auctionId,
      editType: edit.editType,
      status: "PENDING_APPROVAL",
      createdAt: edit.createdAt.toISOString(),
    };
  }
}