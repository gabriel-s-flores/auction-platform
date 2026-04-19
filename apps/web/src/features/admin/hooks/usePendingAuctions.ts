import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function usePendingAuctions(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "pendingAuctions", page, limit],
    queryFn: () => adminService.getPendingAuctions(page, limit),
  });
}

export function useApproveAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (auctionId: string) => adminService.approveAuction(auctionId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "pendingAuctions"] });
    },
  });
}

export function useRejectAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ auctionId, reason }: { auctionId: string; reason: string }) =>
      adminService.rejectAuction(auctionId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "pendingAuctions"] });
    },
  });
}
