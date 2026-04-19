import type {
  CreateAdminRequest,
  CreateAdminResponse,
  DashboardRecentAuctionsResponse,
  DashboardResponse,
  ExportActivityLogsResponse,
  ListActivityLogsQuery,
  ListActivityLogsResponse,
  ListAdminNotificationsResponse,
  ListAdminsResponse,
  ListPendingAuctionsResponse,
  ListPendingEditsResponse,
  ListUsersQuery,
  ListUsersResponse,
  UserDetailResponse,
} from "@auction/shared-types";

import { httpClient } from "@/shared/api/http-client";

function toBooleanQueryValue(value: boolean | undefined) {
  if (value === undefined) {
    return undefined;
  }

  return value ? "true" : "false";
}

function buildQueryString(query: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const search = searchParams.toString();

  return search ? `?${search}` : "";
}

export const adminService = {
  async getDashboardStats(): Promise<DashboardResponse> {
    const response = await httpClient.get<DashboardResponse>("/admin/dashboard/stats");

    return response.data;
  },

  async getRecentAuctions(): Promise<DashboardRecentAuctionsResponse> {
    const response = await httpClient.get<DashboardRecentAuctionsResponse>(
      "/admin/dashboard/recent-auctions"
    );

    return response.data;
  },

  async getActivityLogs(query: ListActivityLogsQuery = {}): Promise<ListActivityLogsResponse> {
    const response = await httpClient.get<ListActivityLogsResponse>(
      `/admin/logs${buildQueryString({
        page: query.page,
        limit: query.limit,
        action: query.action,
        entityType: query.entityType,
        actorId: query.actorId,
        startDate: query.startDate,
        endDate: query.endDate,
      })}`
    );

    return response.data;
  },

  async exportActivityLogs(
    query: Omit<ListActivityLogsQuery, "page" | "limit"> = {}
  ): Promise<ExportActivityLogsResponse> {
    const response = await httpClient.get<ExportActivityLogsResponse>(
      `/admin/logs/export${buildQueryString({
        action: query.action,
        entityType: query.entityType,
        actorId: query.actorId,
        startDate: query.startDate,
        endDate: query.endDate,
      })}`
    );

    return response.data;
  },

  async getPendingAuctions(page = 1, limit = 20): Promise<ListPendingAuctionsResponse> {
    const response = await httpClient.get<ListPendingAuctionsResponse>(
      `/admin/auctions/pending?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  async getPendingEdits(page = 1, limit = 20): Promise<ListPendingEditsResponse> {
    const response = await httpClient.get<ListPendingEditsResponse>(
      `/admin/edits/pending?page=${page}&limit=${limit}`
    );

    return response.data;
  },

  async getNotifications(limit = 10): Promise<ListAdminNotificationsResponse> {
    const response = await httpClient.get<ListAdminNotificationsResponse>(
      `/admin/notifications?limit=${limit}`
    );

    return response.data;
  },

  async approvePendingEdit(editId: string): Promise<void> {
    await httpClient.patch(`/admin/edits/${editId}/approve`);
  },

  async rejectPendingEdit(editId: string, reason: string): Promise<void> {
    await httpClient.patch(`/admin/edits/${editId}/reject`, { reason });
  },

  async getAdmins(): Promise<ListAdminsResponse> {
    const response = await httpClient.get<ListAdminsResponse>("/admin/admins");

    return response.data;
  },

  async createAdmin(payload: CreateAdminRequest): Promise<CreateAdminResponse> {
    const response = await httpClient.post<CreateAdminResponse>("/admin/admins", payload);

    return response.data;
  },

  async demoteAdmin(adminId: string): Promise<void> {
    await httpClient.patch(`/admin/admins/${adminId}/demote`);
  },

  async getUsers(query: ListUsersQuery = {}): Promise<ListUsersResponse> {
    const response = await httpClient.get<ListUsersResponse>(
      `/admin/users${buildQueryString({
        page: query.page,
        limit: query.limit,
        search: query.search,
        role: query.role,
        isBanned: toBooleanQueryValue(query.isBanned),
      })}`
    );

    return response.data;
  },

  async getUserDetail(userId: string): Promise<UserDetailResponse> {
    const response = await httpClient.get<UserDetailResponse>(`/admin/users/${userId}`);

    return response.data;
  },

  async banUser(userId: string, reason: string): Promise<void> {
    await httpClient.patch(`/admin/users/${userId}/ban`, { reason });
  },

  async unbanUser(userId: string): Promise<void> {
    await httpClient.patch(`/admin/users/${userId}/unban`);
  },

  async promoteUser(userId: string): Promise<void> {
    await httpClient.patch(`/admin/users/${userId}/promote`);
  },

  async approveAuction(auctionId: string): Promise<void> {
    await httpClient.patch(`/admin/auctions/${auctionId}/approve`, {});
  },

  async rejectAuction(auctionId: string, reason: string): Promise<void> {
    await httpClient.patch(`/admin/auctions/${auctionId}/reject`, { reason });
  },
};
