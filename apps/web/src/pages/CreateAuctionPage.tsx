import { Alert, Button, Card, CustomDatePicker, FieldError, Input, Label } from "@auction/ui";
import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useCreateAuction } from "@/features/auctions/hooks/useCreateAuction";
import { getErrorMessage } from "@/shared/api/get-error-message";

export function CreateAuctionPage() {
  const navigate = useNavigate();
  const createAuctionMutation = useCreateAuction();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startingPrice, setStartingPrice] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [errors, setErrors] = useState<{
    endsAt?: string;
    startingPrice?: string;
    title?: string;
  }>({});

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const price = Number(startingPrice);
    const endDate = endsAt ? new Date(endsAt) : null;
    const nextErrors = {
      title: title.trim().length >= 3 ? undefined : "Informe um título com pelo menos 3 caracteres.",
      startingPrice: Number.isFinite(price) && price >= 1 ? undefined : "Informe um preço inicial válido.",
      endsAt: endDate && endDate > new Date() ? undefined : "Selecione uma data futura para o encerramento.",
    };

    if (nextErrors.title || nextErrors.startingPrice || nextErrors.endsAt || !endDate) {
      setErrors(nextErrors);
      return;
    }

    const auction = await createAuctionMutation.mutateAsync({
      title,
      description: description || null,
      startingPrice: price,
      endsAt: endDate.toISOString(),
    });

    void navigate(`/auctions/${auction.id}`);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Criar leilão</h2>
          <p className="text-sm text-slate-600">Publique um novo leilão para receber lances.</p>
        </div>

        {createAuctionMutation.isError ? (
          <Alert variant="error">
            {getErrorMessage(createAuctionMutation.error, "Falha ao criar leilão")}
          </Alert>
        ) : null}

        <form className="space-y-3" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="auction-title">Título</Label>
            <Input
              aria-describedby={errors.title ? "auction-title-error" : undefined}
              aria-invalid={Boolean(errors.title)}
              id="auction-title"
              onChange={(event) => {
                setTitle(event.target.value);
                setErrors((current) => ({ ...current, title: undefined }));
              }}
              value={title}
            />
            <FieldError id="auction-title-error">{errors.title}</FieldError>
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
              aria-describedby={errors.startingPrice ? "auction-price-error" : undefined}
              aria-invalid={Boolean(errors.startingPrice)}
              id="auction-price"
              onChange={(event) => {
                setStartingPrice(event.target.value);
                setErrors((current) => ({ ...current, startingPrice: undefined }));
              }}
              step={1}
              type="number"
              value={startingPrice}
            />
            <FieldError id="auction-price-error">{errors.startingPrice}</FieldError>
          </div>

          <div>
            <Label htmlFor="auction-ends-at">Data/hora de encerramento</Label>
            <CustomDatePicker
              aria-describedby={errors.endsAt ? "auction-ends-at-error" : undefined}
              aria-invalid={Boolean(errors.endsAt)}
              includeTime
              id="auction-ends-at"
              min={new Date().toISOString().slice(0, 16)}
              onChange={(value) => {
                setEndsAt(value);
                setErrors((current) => ({ ...current, endsAt: undefined }));
              }}
              value={endsAt}
            />
            <FieldError id="auction-ends-at-error">{errors.endsAt}</FieldError>
          </div>

          <Button className="w-full" disabled={createAuctionMutation.isPending} type="submit">
            {createAuctionMutation.isPending ? "Publicando..." : "Publicar leilão"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
