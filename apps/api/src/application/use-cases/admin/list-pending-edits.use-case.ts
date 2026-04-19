import type { EditStatus, EditType } from "#domain/entities/pending-auction-edit";
import type { PendingEditRepository } from "#domain/repositories/pending-edit-repository";

export interface PendingEditOutput {
  id: string;
  auctionId: string;
  auctionTitle: string;
  editType: EditType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  status: EditStatus;
  rejectionReason: string | null;
  submittedById: string;
  submittedByName: string;
  submittedByEmail: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface ListPendingEditsInput {
  page?: number;
  limit?: number;
  status?: EditStatus;
  auctionId?: string;
}

export interface ListPendingEditsOutput {
  data: PendingEditOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListPendingEditsUseCase {
  constructor(private readonly pendingEditRepository: PendingEditRepository) {}

  async execute(input: ListPendingEditsInput): Promise<ListPendingEditsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.pendingEditRepository.list({
      auctionId: input.auctionId,
      limit,
      page,
      status: input.status ?? "PENDING_APPROVAL",
    });

    return {
      data: result.data.map((edit) => ({
        id: edit.id,
        auctionId: edit.auctionId,
        auctionTitle: edit.auctionTitle,
        editType: edit.editType,
        oldValue: edit.oldValue,
        newValue: edit.newValue,
        status: edit.status,
        rejectionReason: edit.rejectionReason,
        submittedById: edit.submittedById,
        submittedByName: edit.submittedByName,
        submittedByEmail: edit.submittedByEmail,
        reviewedById: edit.reviewedById,
        reviewedAt: edit.reviewedAt?.toISOString() ?? null,
        createdAt: edit.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}