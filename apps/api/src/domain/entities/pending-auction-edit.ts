export type EditType = "TITLE" | "DESCRIPTION" | "IMAGES";
export type EditStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface PendingAuctionEdit {
 id: string;
 auctionId: string;
 editType: EditType;
 oldValue: Record<string, unknown> | null;
 newValue: Record<string, unknown>;
 status: EditStatus;
 rejectionReason: string | null;
 submittedById: string;
 reviewedById: string | null;
 reviewedAt: Date | null;
 createdAt: Date;
}
