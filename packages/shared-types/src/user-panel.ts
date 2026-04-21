import type { PaginationMeta } from "./admin";
import type { AuctionStatus, EditType } from "./auction";
import type { UserRole } from "./auth";

export type UserBidActivityStatus = "LEADING" | "OUTBID" | "WON" | "LOST";
export type UserEditStatus = "PENDING_APPROVAL" | "APPROVED" | "REJECTED";

export interface UserProfileDto {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface UserDashboardSummaryDto {
  profile: UserProfileDto;
  totalAuctions: number;
  activeAuctions: number;
  pendingAuctions: number;
  closedAuctions: number;
  rejectedAuctions: number;
  wonAuctions: number;
  activeBidParticipations: number;
}

export interface GetUserDashboardResponse {
  data: UserDashboardSummaryDto;
}

export interface ListUserAuctionsQuery {
  page?: number;
  limit?: number;
  status?: AuctionStatus;
}

export interface UserAuctionListItemDto {
  id: string;
  title: string;
  description: string | null;
  startingPrice: number;
  highestBid: number;
  status: AuctionStatus;
  endsAt: string;
  createdAt: string;
  rejectionReason: string | null;
  bidsCount: number;
}

export interface ListUserAuctionsResponse {
  data: UserAuctionListItemDto[];
  pagination: PaginationMeta;
}

export interface ListUserWinsQuery {
  page?: number;
  limit?: number;
}

export interface UserWinDto {
  auctionId: string;
  title: string;
  finalBid: number;
  endsAt: string;
  sellerId: string;
  sellerName: string;
}

export interface ListUserWinsResponse {
  data: UserWinDto[];
  pagination: PaginationMeta;
}

export interface ListUserBidsQuery {
  page?: number;
  limit?: number;
  status?: UserBidActivityStatus;
}

export interface UserBidActivityDto {
  auctionId: string;
  title: string;
  auctionStatus: AuctionStatus;
  auctionEndsAt: string;
  sellerName: string;
  highestBid: number;
  userHighestBid: number;
  userBidCount: number;
  status: UserBidActivityStatus;
}

export interface ListUserBidsResponse {
  data: UserBidActivityDto[];
  pagination: PaginationMeta;
}

export interface ListUserPendingEditsQuery {
  page?: number;
  limit?: number;
  status?: UserEditStatus;
}

export interface UserPendingEditDto {
  id: string;
  auctionId: string;
  auctionTitle: string;
  editType: EditType;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  status: UserEditStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export interface ListUserPendingEditsResponse {
  data: UserPendingEditDto[];
  pagination: PaginationMeta;
}