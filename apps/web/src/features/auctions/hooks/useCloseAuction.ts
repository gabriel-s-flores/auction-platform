import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useCloseAuction(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => auctionsService.close(auctionId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["auctions", "open"] }),
        queryClient.invalidateQueries({ queryKey: ["auctions", auctionId] })
      ]);
    }
  });
}
