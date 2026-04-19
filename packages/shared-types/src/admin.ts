import type { AuctionDto, EditType } from "./auction";
import type { UserRole } from "./auth";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Dashboard
export interface DashboardStats {
  totalAuctions: number;
  pendingAuctions: number;
  activeAuctions: number;
  totalBidsToday: number;
  newUsersToday: number;
  totalUsers: number;
}

export interface DashboardResponse {
  data: DashboardStats;
}

export interface RecentAuctionSummary {
  id: string;
  title: string;
  status: string;
  highestBid: number;
  endsAt: string;
  sellerName: string;
  winnerName: string | null;
}

export interface DashboardRecentAuctionsResponse {
  data: RecentAuctionSummary[];
}

// Pending auctions / edits
export interface PendingAuctionDto extends AuctionDto {
  sellerName: string;
  sellerEmail: string;
}

export interface ListPendingAuctionsQuery {
  page?: number;
  limit?: number;
}

export interface ListPendingAuctionsResponse {
  data: PendingAuctionDto[];
  pagination: PaginationMeta;
}

export type PendingEditStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface PendingAuctionEditDto {
  id: string;
  auctionId: string;
  auctionTitle: string;
  editType: EditType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  status: PendingEditStatus;
  rejectionReason: string | null;
  submittedById: string;
  submittedByName: string;
  submittedByEmail: string;
  reviewedById: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ListPendingEditsQuery {
  page?: number;
  limit?: number;
  status?: PendingEditStatus;
  auctionId?: string;
}

export interface ListPendingEditsResponse {
  data: PendingAuctionEditDto[];
  pagination: PaginationMeta;
}

export interface ApproveAuctionRequest {
  auctionId: string;
}

export interface RejectAuctionRequest {
  auctionId: string;
  reason: string;
}

export interface ApproveEditRequest {
  editId: string;
}

export interface RejectEditRequest {
  editId: string;
  reason: string;
}

// Activity Log
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

export interface ActivityLogDto {
  id: string;
  action: ActionType;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ListActivityLogsQuery {
  page?: number;
  limit?: number;
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListActivityLogsResponse {
  data: ActivityLogDto[];
  pagination: PaginationMeta;
}

export interface ExportActivityLogsResponse {
  data: ActivityLogDto[];
  exportedAt: string;
}

// User Management
export interface UserDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isBanned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isBanned?: boolean;
}

export interface ListUsersResponse {
  data: UserDto[];
  pagination: PaginationMeta;
}

export interface UserDetailDto extends UserDto {
  auctionsCount: number;
  bidsCount: number;
  wonAuctionsCount: number;
}

export interface UserDetailResponse {
  data: UserDetailDto;
}

export interface BanUserRequest {
  userId: string;
  reason: string;
}

export interface PromoteUserRequest {
  userId: string;
}

// Admin Management (SUPER_ADMIN only)
export interface AdminDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ListAdminsResponse {
  data: AdminDto[];
}

export interface CreateAdminRequest {
  name: string;
  email: string;
  password: string;
}

export interface CreateAdminResponse {
  data: AdminDto;
}

export interface DemoteAdminRequest {
  adminId: string;
}

// Notifications
export type AdminNotificationType =
  | "AUCTION_PENDING_REVIEW"
  | "AUCTION_APPROVED"
  | "AUCTION_REJECTED"
  | "EDIT_PENDING_REVIEW"
  | "EDIT_APPROVED"
  | "EDIT_REJECTED"
  | "USER_BANNED"
  | "NEW_ADMIN_CREATED";

export interface AdminNotification {
  id: string;
  type: AdminNotificationType;
  entityType: "auction" | "edit" | "user";
  entityId: string;
  message: string;
  timestamp: string;
  actor?: {
    id: string;
    name: string;
  };
}

export interface ListAdminNotificationsResponse {
  data: AdminNotification[];
}
