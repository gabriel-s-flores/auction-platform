import type { AuctionDto } from "@auction/shared-types";
import { Badge, Button, Card } from "@auction/ui";
import { Link } from "react-router-dom";

import { useAuctions } from "@/features/auctions/hooks/useAuctions";

import { Countdown } from "./Countdown";

function getPrimaryThumbnail(auction: AuctionDto): string | null {
  const primaryImage = auction.images?.find((img) => img.isPrimary) ?? auction.images?.[0];
  return primaryImage?.thumbnailUrl ?? null;
}

export function AuctionList() {
  const { data: auctions = [], isLoading, isError } = useAuctions();

  if (isLoading) {
    return <p className="text-sm text-slate-600">Carregando leilões...</p>;
  }

  if (isError) {
    return <p className="text-sm text-rose-700">Falha ao carregar leilões.</p>;
  }

  if (!auctions.length) {
    return <p className="text-sm text-slate-600">Nenhum leilão aberto no momento.</p>;
  }

  return (
    <section className="space-y-4">
      {auctions.map((auction: AuctionDto) => {
        const thumbnailUrl = getPrimaryThumbnail(auction);

        return (
          <Card key={auction.id} className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-100">
              {thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={thumbnailUrl} alt={auction.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-lg font-semibold text-slate-900 truncate">{auction.title}</p>
              <div className="my-1">
                <Badge variant={auction.status === "OPEN" ? "success" : "danger"}>
                  {auction.status}
                </Badge>
              </div>
              <Countdown endsAt={auction.endsAt} variant="compact" />
              <p className="text-sm text-slate-600">Maior lance: R$ {auction.highestBid.toFixed(2)}</p>
            </div>

            {/* Action */}
            <Link to={`/auctions/${auction.id}`} className="flex-shrink-0">
              <Button variant="primary">Ver detalhes</Button>
            </Link>
          </Card>
        );
      })}
    </section>
  );
}
