import { useQuery } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useAuction(auctionId: string) {
  return useQuery({
    queryKey: ["auction", auctionId],
    queryFn: () => auctionsService.getById(auctionId),
    enabled: Boolean(auctionId)
  });
}
