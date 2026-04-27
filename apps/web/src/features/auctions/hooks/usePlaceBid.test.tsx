import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";

import { auctionsService } from "@/features/auctions/services/auctions.service";

import { usePlaceBid } from "./usePlaceBid";

vi.mock("@/features/auctions/services/auctions.service", () => ({
  auctionsService: {
    placeBid: vi.fn(),
  },
}));

const mockedAuctionsService = vi.mocked(auctionsService);

function createQueryWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe("usePlaceBid", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("places a bid and invalidates auction, list, and user-panel queries", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const invalidateQueries = vi.spyOn(queryClient, "invalidateQueries");
    mockedAuctionsService.placeBid.mockResolvedValue({
      bid: {
        amount: 150,
        auctionId: "auction-1",
        bidderId: "bidder-1",
        createdAt: "2026-01-01T00:00:00.000Z",
        id: "bid-1",
      },
    });

    const { result } = renderHook(() => usePlaceBid("auction-1"), {
      wrapper: createQueryWrapper(queryClient),
    });

    await act(async () => {
      await result.current.mutateAsync({ amount: 150 });
    });

    expect(mockedAuctionsService.placeBid).toHaveBeenCalledWith("auction-1", {
      amount: 150,
    });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["auctions", "open"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["auction", "auction-1"] });
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ["user-panel"] });
  });
});
