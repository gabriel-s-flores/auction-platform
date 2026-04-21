import type { PlaceBidRequest } from "@auction/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function usePlaceBid(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlaceBidRequest) => auctionsService.placeBid(auctionId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auctions", "open"] }),
        queryClient.invalidateQueries({ queryKey: ["auction", auctionId] }),
        queryClient.invalidateQueries({ queryKey: ["user-panel"] }),
      ]);
    }
  });
}
