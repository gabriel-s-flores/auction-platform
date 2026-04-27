import type {
  ListActivityLogsResponse,
  ListUsersResponse,
} from "@auction/shared-types";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { httpClient } from "@/shared/api/http-client";

import { adminService } from "./admin.service";

vi.mock("@/shared/api/http-client", () => ({
  httpClient: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

type MockedHttpClient = {
  get: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
};

const httpClientMock = httpClient as unknown as MockedHttpClient;

describe("adminService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("builds activity log query strings without empty filters", async () => {
    const responseData: ListActivityLogsResponse = {
      data: [],
      pagination: {
        limit: 25,
        page: 2,
        total: 0,
        totalPages: 0,
      },
    };
    httpClientMock.get.mockResolvedValueOnce({ data: responseData });

    const result = await adminService.getActivityLogs({
      action: "USER_BANNED",
      actorId: "admin-1",
      endDate: "2026-01-31",
      entityType: "user",
      limit: 25,
      page: 2,
      startDate: "2026-01-01",
    });

    expect(result).toBe(responseData);
    expect(httpClientMock.get).toHaveBeenCalledWith(
      "/admin/logs?page=2&limit=25&action=USER_BANNED&entityType=user&actorId=admin-1&startDate=2026-01-01&endDate=2026-01-31"
    );
  });

  test("serializes user filters, including false boolean values", async () => {
    const responseData: ListUsersResponse = {
      data: [],
      pagination: {
        limit: 20,
        page: 1,
        total: 0,
        totalPages: 0,
      },
    };
    httpClientMock.get.mockResolvedValueOnce({ data: responseData });

    const result = await adminService.getUsers({
      isBanned: false,
      limit: 20,
      page: 1,
      role: "USER",
      search: "buyer",
    });

    expect(result).toBe(responseData);
    expect(httpClientMock.get).toHaveBeenCalledWith(
      "/admin/users?page=1&limit=20&search=buyer&role=USER&isBanned=false"
    );
  });

  test("sends moderation mutation payloads to the expected endpoints", async () => {
    httpClientMock.patch.mockResolvedValue({ data: undefined });

    await adminService.banUser("user-1", "fraud");
    await adminService.rejectAuction("auction-1", "missing photos");
    await adminService.markNotificationAsRead("notification-1");

    expect(httpClientMock.patch).toHaveBeenNthCalledWith(
      1,
      "/admin/users/user-1/ban",
      { reason: "fraud" }
    );
    expect(httpClientMock.patch).toHaveBeenNthCalledWith(
      2,
      "/admin/auctions/auction-1/reject",
      { reason: "missing photos" }
    );
    expect(httpClientMock.patch).toHaveBeenNthCalledWith(
      3,
      "/admin/notifications/notification-1/read"
    );
  });
});
