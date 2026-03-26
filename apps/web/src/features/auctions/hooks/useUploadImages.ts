import type { ImageDto } from "@auction/shared-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export interface UploadProgress {
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Whether upload is in progress */
  isUploading: boolean;
}

export function useUploadImages(auctionId: string) {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation<ImageDto[], Error, File[]>({
    mutationFn: (files) =>
      auctionsService.uploadImages(auctionId, files, (p) => setProgress(p)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
      void queryClient.invalidateQueries({
        queryKey: ["auction-images", auctionId],
      });
      setProgress(0);
    },
    onError: () => {
      setProgress(0);
    },
  });

  return {
    ...mutation,
    progress: mutation.isPending ? progress : 0,
    isUploading: mutation.isPending,
  };
}
