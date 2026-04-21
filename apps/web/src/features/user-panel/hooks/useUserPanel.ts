import type {
  ListUserAuctionsQuery,
  ListUserBidsQuery,
  ListUserPendingEditsQuery,
  ListUserWinsQuery,
} from "@auction/shared-types";
import { useQuery } from "@tanstack/react-query";

import { userPanelService } from "@/features/user-panel/services/user-panel.service";

export function useUserDashboard() {
  return useQuery({
    queryKey: ["user-panel", "dashboard"],
    queryFn: userPanelService.getDashboard,
  });
}

export function useUserAuctions(query: ListUserAuctionsQuery) {
  const queryKey = ["user-panel", "auctions", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , currentQuery] }) => userPanelService.getAuctions(currentQuery),
  });
}

export function useUserWins(query: ListUserWinsQuery) {
  const queryKey = ["user-panel", "wins", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , currentQuery] }) => userPanelService.getWins(currentQuery),
  });
}

export function useUserBids(query: ListUserBidsQuery) {
  const queryKey = ["user-panel", "bids", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , currentQuery] }) => userPanelService.getBids(currentQuery),
  });
}

export function useUserPendingEdits(query: ListUserPendingEditsQuery) {
  const queryKey = ["user-panel", "edits", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , currentQuery] }) => userPanelService.getPendingEdits(currentQuery),
  });
}