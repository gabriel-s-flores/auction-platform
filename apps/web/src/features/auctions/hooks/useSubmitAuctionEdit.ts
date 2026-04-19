import type { SubmitAuctionEditRequest } from "@auction/shared-types";
import { useMutation } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useSubmitAuctionEdit(auctionId: string) {
  return useMutation({
    mutationFn: (payload: SubmitAuctionEditRequest) =>
      auctionsService.submitEdit(auctionId, payload),
  });
}