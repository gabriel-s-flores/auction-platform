import type { EditStatus, EditType, PendingAuctionEdit } from "#domain/entities/pending-auction-edit";

export interface CreatePendingEditInput {
 auctionId: string;
 editType: EditType;
 oldValue: Record<string, unknown> | null;
 newValue: Record<string, unknown>;
 submittedById: string;
}

export interface ListPendingEditsInput {
 page?: number;
 limit?: number;
 status?: EditStatus;
 auctionId?: string;
}

export interface PendingEditSummary extends PendingAuctionEdit {
  auctionTitle: string;
  submittedByName: string;
  submittedByEmail: string;
}

export interface ListUserPendingEditsInput {
  submittedById: string;
  page?: number;
  limit?: number;
  status?: EditStatus;
}

export interface UserPendingEditSummary extends PendingAuctionEdit {
  auctionTitle: string;
}

export interface PendingEditRepository {
 create(input: CreatePendingEditInput): Promise<PendingAuctionEdit>;
 findById(id: string): Promise<PendingAuctionEdit | null>;
 list(input: ListPendingEditsInput): Promise<{ data: PendingEditSummary[]; total: number }>;
  listBySubmittedBy(input: ListUserPendingEditsInput): Promise<{ data: UserPendingEditSummary[]; total: number }>;
 approve(id: string, reviewedBy: string): Promise<PendingAuctionEdit>;
 reject(id: string, reviewedBy: string, reason: string): Promise<PendingAuctionEdit>;
}
