import type { CreateAuctionRequest } from "@auction/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useCreateAuction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAuctionRequest) => auctionsService.create(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auctions", "open"] });
    }
  });
}
