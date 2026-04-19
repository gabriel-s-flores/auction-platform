import { AppError } from "#application/errors/app-error";
import type { AuditService } from "#application/services/audit-service";
import type { PendingEditRepository } from "#domain/repositories/pending-edit-repository";
import { prisma } from "#infrastructure/database/prisma-client";

interface ApprovePendingEditInput {
  editId: string;
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}

function getStringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

export class ApprovePendingEditUseCase {
  constructor(
    private readonly pendingEditRepository: PendingEditRepository,
    private readonly auditService: AuditService
  ) {}

  async execute(input: ApprovePendingEditInput): Promise<void> {
    const edit = await this.pendingEditRepository.findById(input.editId);

    if (!edit) {
      throw new AppError("Edição pendente não encontrada", 404);
    }

    if (edit.status !== "PENDING_APPROVAL") {
      throw new AppError("Edição não está pendente de aprovação", 409);
    }

    await prisma.$transaction(async (tx) => {
      const updateData: Record<string, unknown> = { version: { increment: 1 } };

      if (edit.editType === "TITLE") {
        const title = getStringValue(edit.newValue.title);

        if (!title) {
          throw new AppError("Novo título inválido", 400);
        }

        updateData.title = title;
      }

      if (edit.editType === "DESCRIPTION") {
        const description = getStringValue(edit.newValue.description);
        updateData.description = description;
      }

      if (edit.editType === "IMAGES") {
        const images = edit.newValue.images;

        if (!Array.isArray(images)) {
          throw new AppError("Payload de imagens inválido", 400);
        }

        await tx.image.deleteMany({ where: { auctionId: edit.auctionId } });
        await tx.image.createMany({
          data: images.map((image, index) => {
            const candidate = image as Record<string, unknown>;

            return {
              alt: typeof candidate.alt === "string" ? candidate.alt : null,
              auctionId: edit.auctionId,
              isPrimary: typeof candidate.isPrimary === "boolean" ? candidate.isPrimary : index === 0,
              mimeType: typeof candidate.mimeType === "string" ? candidate.mimeType : "image/jpeg",
              position: typeof candidate.position === "number" ? candidate.position : index,
              publicId: typeof candidate.publicId === "string" ? candidate.publicId : null,
              size: typeof candidate.size === "number" ? candidate.size : 0,
              url: typeof candidate.url === "string" ? candidate.url : "",
            };
          }),
        });
      }

      await tx.auction.update({
        where: { id: edit.auctionId },
        data: updateData,
      });

      await tx.pendingAuctionEdit.update({
        where: { id: input.editId },
        data: {
          reviewedAt: new Date(),
          reviewedById: input.adminId,
          status: "APPROVED",
        },
      });
    });

    await this.auditService.log(
      "EDIT_APPROVED",
      "pending_edit",
      edit.id,
      {
        auctionId: edit.auctionId,
        editType: edit.editType,
      },
      {
        actorId: input.adminId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      }
    );
  }
}