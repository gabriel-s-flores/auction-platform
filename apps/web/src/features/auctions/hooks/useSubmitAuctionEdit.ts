import type { SubmitAuctionEditRequest } from "@auction/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useSubmitAuctionEdit(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitAuctionEditRequest) =>
      auctionsService.submitEdit(auctionId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["user-panel"] }),
      ]);
    },
  });
}