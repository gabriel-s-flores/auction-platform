import type { EditStatus, EditType } from "#domain/entities/pending-auction-edit";
import type { PendingEditRepository } from "#domain/repositories/pending-edit-repository";

export interface ListUserPendingEditsInput {
  userId: string;
  page?: number;
  limit?: number;
  status?: EditStatus;
}

export interface UserPendingEditOutput {
  id: string;
  auctionId: string;
  auctionTitle: string;
  editType: EditType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  status: EditStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ListUserPendingEditsOutput {
  data: UserPendingEditOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUserPendingEditsUseCase {
  constructor(private readonly pendingEditRepository: PendingEditRepository) {}

  async execute(input: ListUserPendingEditsInput): Promise<ListUserPendingEditsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const result = await this.pendingEditRepository.listBySubmittedBy({
      submittedById: input.userId,
      page,
      limit,
      status: input.status,
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