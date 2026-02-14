import { useQuery } from "@tanstack/react-query";
import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useAuctions() {
  return useQuery({
    queryKey: ["auctions", "open"],
    queryFn: auctionsService.listOpen
  });
}
