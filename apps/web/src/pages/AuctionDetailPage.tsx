import { useMemo, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { Alert, Badge, Button, Card, Input, Label } from "@auction/ui";
import { useAuction } from "@/features/auctions/hooks/useAuction";
import { useCloseAuction } from "@/features/auctions/hooks/useCloseAuction";
import { usePlaceBid } from "@/features/auctions/hooks/usePlaceBid";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useAuth } from "@/shared/auth/auth-context";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

export function AuctionDetailPage() {
  const { auctionId = "" } = useParams();
  const { isAuthenticated } = useAuth();

  const auctionQuery = useAuction(auctionId);
  const placeBidMutation = usePlaceBid(auctionId);
  const closeAuctionMutation = useCloseAuction(auctionId);

  const [bidAmount, setBidAmount] = useState("");

  const minBid = useMemo(() => {
    if (!auctionQuery.data) {
      return 1;
    }

    return auctionQuery.data.highestBid + 1;
  }, [auctionQuery.data]);

  async function handlePlaceBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await placeBidMutation.mutateAsync({ amount: Number(bidAmount) });
    setBidAmount("");
  }

  async function handleCloseAuction() {
    await closeAuctionMutation.mutateAsync();
  }

  if (auctionQuery.isLoading) {
    return <p className="text-sm text-slate-600">Carregando leilão...</p>;
  }

  if (auctionQuery.isError || !auctionQuery.data) {
    return (
      <Alert variant="error">
        {getErrorMessage(auctionQuery.error, "Não foi possível carregar o leilão")} <Link to="/auctions">Voltar</Link>
      </Alert>
    );
  }

  const auction = auctionQuery.data;

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{auction.title}</h2>
            <p className="text-sm text-slate-600">Encerramento: {formatDate(auction.endsAt)}</p>
          </div>

          <Badge variant={auction.status === "OPEN" ? "success" : "danger"}>{auction.status}</Badge>
        </div>

        <p className="text-slate-700">{auction.description ?? "Sem descrição cadastrada."}</p>

        <div className="grid gap-2 text-sm text-slate-700">
          <p>
            <span className="font-semibold">Lance inicial:</span> {formatCurrency(auction.startingPrice)}
          </p>
          <p>
            <span className="font-semibold">Maior lance:</span> {formatCurrency(auction.highestBid)}
          </p>
        </div>
      </Card>

      {isAuthenticated ? (
        <Card className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Enviar lance</h3>

          {placeBidMutation.isError ? (
            <Alert variant="error">{getErrorMessage(placeBidMutation.error, "Falha ao enviar lance")}</Alert>
          ) : null}

          {placeBidMutation.isSuccess ? <Alert variant="success">Lance enviado com sucesso!</Alert> : null}

          <form className="space-y-3" onSubmit={handlePlaceBid}>
            <div>
              <Label htmlFor="bid-amount">Valor do lance</Label>
              <Input
                id="bid-amount"
                min={minBid}
                onChange={(event) => setBidAmount(event.target.value)}
                required
                step={1}
                type="number"
                value={bidAmount}
              />
              <p className="mt-1 text-xs text-slate-500">Mínimo permitido: {formatCurrency(minBid)}</p>
            </div>

            <Button className="w-full" disabled={placeBidMutation.isPending || auction.status !== "OPEN"} type="submit">
              {placeBidMutation.isPending ? "Enviando..." : "Dar lance"}
            </Button>
          </form>

          <Button
            className="w-full"
            disabled={closeAuctionMutation.isPending || auction.status !== "OPEN"}
            onClick={handleCloseAuction}
            type="button"
            variant="secondary"
          >
            {closeAuctionMutation.isPending ? "Encerrando..." : "Encerrar leilão"}
          </Button>

          {closeAuctionMutation.isError ? (
            <Alert variant="error">{getErrorMessage(closeAuctionMutation.error, "Falha ao encerrar leilão")}</Alert>
          ) : null}
        </Card>
      ) : (
        <Alert variant="info">
          Faça <Link className="font-semibold underline" to="/login">login</Link> para enviar lances e gerenciar leilões.
        </Alert>
      )}
    </div>
  );
}
