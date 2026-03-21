import type { ImageDto } from "@auction/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useUploadImages(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation<ImageDto[], Error, File[]>({
    mutationFn: (files) => auctionsService.uploadImages(auctionId, files),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      void queryClient.invalidateQueries({ queryKey: ["auction-images", auctionId] });
    },
  });
}
