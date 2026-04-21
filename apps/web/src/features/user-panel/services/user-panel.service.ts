import type {
  GetUserDashboardResponse,
  ListUserAuctionsQuery,
  ListUserAuctionsResponse,
  ListUserBidsQuery,
  ListUserBidsResponse,
  ListUserPendingEditsQuery,
  ListUserPendingEditsResponse,
  ListUserWinsQuery,
  ListUserWinsResponse,
} from "@auction/shared-types";

import { httpClient } from "@/shared/api/http-client";

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

export const userPanelService = {
  async getDashboard(): Promise<GetUserDashboardResponse> {
    const response = await httpClient.get<GetUserDashboardResponse>("/users/me/dashboard");

    return response.data;
  },

  async getAuctions(query: ListUserAuctionsQuery = {}): Promise<ListUserAuctionsResponse> {
    const response = await httpClient.get<ListUserAuctionsResponse>(
      `/users/me/auctions${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
      })}`
    );

    return response.data;
  },

  async getWins(query: ListUserWinsQuery = {}): Promise<ListUserWinsResponse> {
    const response = await httpClient.get<ListUserWinsResponse>(
      `/users/me/wins${buildQueryString({
        page: query.page,
        limit: query.limit,
      })}`
    );

    return response.data;
  },

  async getBids(query: ListUserBidsQuery = {}): Promise<ListUserBidsResponse> {
    const response = await httpClient.get<ListUserBidsResponse>(
      `/users/me/bids${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
      })}`
    );

    return response.data;
  },

  async getPendingEdits(
    query: ListUserPendingEditsQuery = {}
  ): Promise<ListUserPendingEditsResponse> {
    const response = await httpClient.get<ListUserPendingEditsResponse>(
      `/users/me/edits${buildQueryString({
        page: query.page,
        limit: query.limit,
        status: query.status,
      })}`
    );

    return response.data;
  },
};