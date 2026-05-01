import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthProvider } from "@/shared/auth/auth-context";
import { ModalProvider } from "@/shared/modal";
import { AuctionEventsProvider } from "@/shared/websocket/auction-events";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 1,
			refetchOnWindowFocus: false
		}
	}
});

export function AppProviders({ children }: PropsWithChildren) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				<ModalProvider>
					<AuctionEventsProvider>{children}</AuctionEventsProvider>
				</ModalProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
