import { Link } from "react-router-dom";
import type { AuctionDto } from "@auction/shared-types";
import { Badge, Button, Card } from "@auction/ui";
import { useAuctions } from "@/features/auctions/hooks/useAuctions";

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
      {auctions.map((auction: AuctionDto) => (
        <Card key={auction.id} className="flex items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">{auction.title}</p>
            <div className="mb-1 mt-1">
              <Badge variant={auction.status === "OPEN" ? "success" : "danger"}>{auction.status}</Badge>
            </div>
            <p className="text-sm text-slate-600">Maior lance: R$ {auction.highestBid.toFixed(2)}</p>
          </div>

          <Link to={`/auctions/${auction.id}`}>
            <Button variant="primary">Ver detalhes</Button>
          </Link>
        </Card>
      ))}
    </section>
  );
}
