export type ActionType =
 | "USER_LOGIN"
 | "USER_LOGOUT"
 | "LOGIN_FAILED"
 | "AUCTION_CREATED"
 | "AUCTION_APPROVED"
 | "AUCTION_REJECTED"
 | "AUCTION_CLOSED"
 | "AUCTION_CANCELLED"
 | "EDIT_SUBMITTED"
 | "EDIT_APPROVED"
 | "EDIT_REJECTED"
 | "BID_PLACED"
 | "BID_OUTBID"
 | "ADMIN_CREATED"
 | "ADMIN_REMOVED"
 | "USER_BANNED"
 | "USER_UNBANNED"
 | "IMAGE_UPLOADED"
 | "IMAGE_DELETED";

export interface ActivityLog {
 id: string;
 action: ActionType;
 entityType: string;
 entityId: string;
 actorId: string | null;
 actorName: string | null;
 actorEmail: string | null;
 metadata: Record<string, unknown> | null;
 ipAddress: string | null;
 userAgent: string | null;
 createdAt: Date;
}
