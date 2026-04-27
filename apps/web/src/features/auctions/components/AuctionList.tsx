import type { AuctionDto } from "@auction/shared-types";
import { AuctionCard } from "@auction/ui";
import { useMemo } from "react";
import { Link } from "react-router-dom";

import { useAuctions } from "@/features/auctions/hooks/useAuctions";
import { useCountdownTicker } from "@/features/auctions/hooks/useCountdownTicker";

import { getTimeRemainingState } from "./Countdown";

const ENDING_SOON_THRESHOLD_MS = 5 * 60 * 1000;

interface AuctionListItemViewModel {
  auction: AuctionDto;
  timeRemainingMs: number;
  timeState: ReturnType<typeof getTimeRemainingState>;
}

const AuctionCardLink = (props: React.ComponentPropsWithRef<typeof Link>) => (
  <Link {...props} />
);

export function AuctionList() {
  const { data: auctions = [], isLoading, isError } = useAuctions();
  const currentTimestamp = useCountdownTicker({
    enabled: !isLoading && !isError && auctions.length > 0,
  });

  const auctionItems = useMemo<AuctionListItemViewModel[]>(() => {
    return auctions.map((auction) => {
      const timeRemainingMs = new Date(auction.endsAt).getTime() - currentTimestamp;

      return {
        auction,
        timeRemainingMs,
        timeState: getTimeRemainingState(timeRemainingMs),
      };
    });
  }, [auctions, currentTimestamp]);

  const endingSoonItems = useMemo(() => {
    return auctionItems.filter(
      ({ auction, timeRemainingMs }) =>
        auction.status === "OPEN" &&
        timeRemainingMs > 0 &&
        timeRemainingMs <= ENDING_SOON_THRESHOLD_MS
    );
  }, [auctionItems]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600" />
          <p className="text-sm text-slate-600">Carregando leilões...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center">
        <svg
          className="mx-auto mb-2 h-8 w-8 text-rose-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm font-medium text-rose-700">Falha ao carregar leilões.</p>
      </div>
    );
  }

  if (!auctions.length) {
    return (
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-8 text-center">
        <svg
          className="mx-auto mb-2 h-10 w-10 text-stone-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
        <p className="text-sm text-slate-600">Nenhum leilão aberto no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Ending Soon Section */}
      {endingSoonItems.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-rose-500" />
            </span>
            <h3 className="text-lg font-semibold text-rose-700">Terminando em breve</h3>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-medium text-rose-700">
              {endingSoonItems.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {endingSoonItems.map(({ auction, timeState }) => {
              return (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  timeRemaining={timeState}
                  linkComponent={AuctionCardLink}
                />
              );
            })}
          </div>
        </section>
      )}

      {/* All Auctions Section */}
      <section>
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Todos os leilões</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {auctionItems.map(({ auction, timeState }) => {
            return (
              <AuctionCard
                key={auction.id}
                auction={auction}
                timeRemaining={timeState}
                linkComponent={AuctionCardLink}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
}
