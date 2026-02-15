import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Input, Label } from "@auction/ui";
import { useCreateAuction } from "@/features/auctions/hooks/useCreateAuction";
import { getErrorMessage } from "@/shared/api/get-error-message";

export function CreateAuctionPage() {
  const navigate = useNavigate();
  const createAuctionMutation = useCreateAuction();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [endsAt, setEndsAt] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const auction = await createAuctionMutation.mutateAsync({
      title,
      description: description || null,
      startingPrice: Number(startingPrice),
      endsAt: new Date(endsAt).toISOString()
    });

    navigate(`/auctions/${auction.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Criar leilão</h2>
          <p className="text-sm text-slate-600">Publique um novo leilão para receber lances.</p>
        </div>

        {createAuctionMutation.isError ? (
          <Alert variant="error">{getErrorMessage(createAuctionMutation.error, "Falha ao criar leilão")}</Alert>
        ) : null}

        <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="auction-title">Título</Label>
            <Input
              id="auction-title"
              minLength={3}
              onChange={(event) => setTitle(event.target.value)}
              required
              value={title}
            />
          </div>

          <div>
            <Label htmlFor="auction-description">Descrição</Label>
            <Input
              id="auction-description"
              onChange={(event) => setDescription(event.target.value)}
              value={description}
            />
          </div>

          <div>
            <Label htmlFor="auction-price">Preço inicial</Label>
            <Input
              id="auction-price"
              min={1}
              onChange={(event) => setStartingPrice(event.target.value)}
              required
              step={1}
              type="number"
              value={startingPrice}
            />
          </div>

          <div>
            <Label htmlFor="auction-ends-at">Data/hora de encerramento</Label>
            <Input
              id="auction-ends-at"
              onChange={(event) => setEndsAt(event.target.value)}
              required
              type="datetime-local"
              value={endsAt}
            />
          </div>

          <Button className="w-full" disabled={createAuctionMutation.isPending} type="submit">
            {createAuctionMutation.isPending ? "Publicando..." : "Publicar leilão"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
