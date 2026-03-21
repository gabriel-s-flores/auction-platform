import { useMutation, useQueryClient } from "@tanstack/react-query";

import { auctionsService } from "@/features/auctions/services/auctions.service";

export function useReorderImages(auctionId: string) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (positions: Array<{ id: string; position: number; isPrimary: boolean }>) =>
			auctionsService.reorderImages(auctionId, { positions }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: ["auction", auctionId] });
		},
	});
}
