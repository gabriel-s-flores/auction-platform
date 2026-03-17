import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";

import { AuthProvider } from "@/shared/auth/auth-context";
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
				<AuctionEventsProvider>{children}</AuctionEventsProvider>
			</AuthProvider>
		</QueryClientProvider>
	);
}
