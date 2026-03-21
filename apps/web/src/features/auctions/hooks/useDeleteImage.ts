import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

interface DeleteImageVariables {
  auctionId: string;
  imageId: string;
}

export function useDeleteImage(auctionId: string) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: (imageId) => auctionsService.deleteImage(auctionId, imageId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      void queryClient.invalidateQueries({ queryKey: ["auction-images", auctionId] });
    },
  });
}
