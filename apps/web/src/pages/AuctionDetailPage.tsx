import type { AuctionDto, AuctionStatus, ImageDto } from "@auction/shared-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  ImageCarousel,
  ImageUploader,
  Input,
  Label,
} from "@auction/ui";
import type { SyntheticEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { Countdown } from "@/features/auctions/components/Countdown";
import { useAuction } from "@/features/auctions/hooks/useAuction";
import { useCloseAuction } from "@/features/auctions/hooks/useCloseAuction";
import { useDeleteImage } from "@/features/auctions/hooks/useDeleteImage";
import { usePlaceBid } from "@/features/auctions/hooks/usePlaceBid";
import { useReorderImages } from "@/features/auctions/hooks/useReorderImages";
import { useSubmitAuctionEdit } from "@/features/auctions/hooks/useSubmitAuctionEdit";
import { useUploadImages } from "@/features/auctions/hooks/useUploadImages";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useAuth } from "@/shared/auth/auth-context";
import { useAuctionRoom } from "@/shared/websocket/auction-events";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getAuctionStatusBadge(status: AuctionStatus, isAuctionOpen: boolean) {
  if (isAuctionOpen) {
    return {
      label: "Aberto",
      variant: "success" as const,
    };
  }

  switch (status) {
    case "PENDING_APPROVAL":
      return {
        label: "Pendente",
        variant: "neutral" as const,
      };
    case "REJECTED":
      return {
        label: "Rejeitado",
        variant: "danger" as const,
      };
    case "CLOSED":
    case "OPEN":
    default:
      return {
        label: "Encerrado",
        variant: "danger" as const,
      };
  }
}

interface StatusNoticeProps {
  tone: "info" | "danger" | "neutral";
  title: string;
  message: string;
  icon: "info" | "warning" | "clock";
  className?: string;
}

function StatusNotice({ tone, title, message, icon, className = "" }: StatusNoticeProps) {
  const toneStyles = {
    info: {
      container: "border-sky-200 bg-sky-50",
      iconContainer: "bg-sky-100 text-sky-600",
      title: "text-sky-900",
      message: "text-sky-800",
    },
    danger: {
      container: "border-rose-200 bg-rose-50",
      iconContainer: "bg-rose-100 text-rose-600",
      title: "text-rose-900",
      message: "text-rose-800",
    },
    neutral: {
      container: "border-stone-200 bg-stone-50",
      iconContainer: "bg-stone-100 text-stone-600",
      title: "text-slate-900",
      message: "text-slate-600",
    },
  };

  const selectedTone = toneStyles[tone];

  const iconMarkup = {
    info: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    warning: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m6.938 4H5.062c-1.536 0-2.5-1.664-1.732-3L10.268 4c.768-1.336 2.696-1.336 3.464 0l6.938 12c.768 1.336-.196 3-1.732 3z"
        />
      </svg>
    ),
    clock: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className={`rounded-2xl border px-4 py-4 ${selectedTone.container} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`rounded-full p-2 ${selectedTone.iconContainer}`}>{iconMarkup[icon]}</div>
        <div>
          <p className={`text-sm font-semibold ${selectedTone.title}`}>{title}</p>
          <p className={`mt-1 text-sm ${selectedTone.message}`}>{message}</p>
        </div>
      </div>
    </div>
  );
}

interface AuctionStatusHeroProps {
  displayEndsAt: string;
  isAuctionOpen: boolean;
  onExpire: () => void;
  rejectionReason: string | null;
  status: AuctionStatus;
}

function AuctionStatusHero({
  displayEndsAt,
  isAuctionOpen,
  onExpire,
  rejectionReason,
  status,
}: AuctionStatusHeroProps) {
  if (isAuctionOpen) {
    return <Countdown variant="hero" endsAt={displayEndsAt} onExpire={onExpire} />;
  }

  if (status === "PENDING_APPROVAL") {
    return (
      <StatusNotice
        tone="info"
        icon="info"
        title="Aguardando aprovação administrativa"
        message="Este leilão ainda está em revisão e será liberado para lances após a aprovação."
      />
    );
  }

  if (status === "REJECTED") {
    return (
      <StatusNotice
        tone="danger"
        icon="warning"
        title="Leilão não aprovado"
        message={
          rejectionReason?.trim() ||
          "Este leilão foi rejeitado pela administração e não está disponível para lances."
        }
      />
    );
  }

  return (
    <StatusNotice
      tone="neutral"
      icon="clock"
      title="Leilão encerrado"
      message="Este leilão não está mais aceitando novos lances."
    />
  );
}

interface OpenAuctionBidCardProps {
  bidAmount: string;
  minBid: number;
  isOwner: boolean;
  placeBidState: {
    error: unknown;
    isError: boolean;
    isPending: boolean;
    isSuccess: boolean;
  };
  closeAuctionState: {
    error: unknown;
    isError: boolean;
    isPending: boolean;
  };
  onBidAmountChange: (value: string) => void;
  onCloseAuction: () => void;
  onSubmitBid: (event: SyntheticEvent<HTMLFormElement, Event>) => void;
}

function OpenAuctionBidCard({
  bidAmount,
  minBid,
  isOwner,
  placeBidState,
  closeAuctionState,
  onBidAmountChange,
  onCloseAuction,
  onSubmitBid,
}: OpenAuctionBidCardProps) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">Enviar lance</h3>

      {placeBidState.isError ? (
        <div className="mb-4">
          <Alert variant="error">
            {getErrorMessage(placeBidState.error, "Falha ao enviar lance")}
          </Alert>
        </div>
      ) : null}

      {placeBidState.isSuccess ? (
        <div className="mb-4">
          <Alert variant="success">Lance enviado com sucesso!</Alert>
        </div>
      ) : null}

      <form className="space-y-4" onSubmit={onSubmitBid}>
        <div>
          <Label htmlFor="bid-amount">Valor do lance</Label>
          <div className="mt-1.5 relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              R$
            </span>
            <Input
              id="bid-amount"
              min={minBid}
              onChange={(event) => onBidAmountChange(event.target.value)}
              required
              step={1}
              type="number"
              value={bidAmount}
              className="pl-8"
            />
          </div>
          <p className="mt-1.5 text-xs text-slate-500">
            Lance mínimo: <span className="font-medium">{formatCurrency(minBid)}</span>
          </p>
        </div>

        <Button className="w-full py-3 text-base font-semibold" disabled={placeBidState.isPending} type="submit">
          {placeBidState.isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Enviando...
            </span>
          ) : (
            "Dar lance"
          )}
        </Button>
      </form>

      {isOwner ? (
        <Button
          className="mt-3 w-full"
          disabled={closeAuctionState.isPending}
          onClick={onCloseAuction}
          type="button"
          variant="secondary"
        >
          {closeAuctionState.isPending ? "Encerrando..." : "Encerrar leilão agora"}
        </Button>
      ) : null}

      {closeAuctionState.isError ? (
        <div className="mt-3">
          <Alert variant="error">
            {getErrorMessage(closeAuctionState.error, "Falha ao encerrar leilão")}
          </Alert>
        </div>
      ) : null}
    </div>
  );
}

interface AuctionActionPanelProps extends OpenAuctionBidCardProps {
  isAuthenticated: boolean;
  isAuctionOpen: boolean;
  rejectionReason: string | null;
  status: AuctionStatus;
}

function AuctionActionPanel({
  isAuthenticated,
  isAuctionOpen,
  rejectionReason,
  status,
  ...openAuctionBidCardProps
}: AuctionActionPanelProps) {
  if (isAuctionOpen) {
    if (isAuthenticated) {
      return <OpenAuctionBidCard {...openAuctionBidCardProps} />;
    }

    return (
      <div className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-6 text-center">
        <svg
          className="mx-auto mb-3 h-8 w-8 text-sky-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
          />
        </svg>
        <p className="mb-3 text-sm text-slate-600">
          Faça login para enviar lances e participar dos leilões.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-700"
        >
          Entrar
        </Link>
      </div>
    );
  }

  if (status === "PENDING_APPROVAL") {
    return (
      <StatusNotice
        tone="info"
        icon="info"
        title="Leilão em revisão"
        message="Este item está aguardando aprovação administrativa e ainda não pode receber lances."
        className="p-5 shadow-sm"
      />
    );
  }

  if (status === "REJECTED") {
    return (
      <StatusNotice
        tone="danger"
        icon="warning"
        title="Leilão rejeitado"
        message={
          rejectionReason?.trim() ||
          "Este item não foi aprovado pela administração e permanece indisponível para lances."
        }
        className="p-5 shadow-sm"
      />
    );
  }

  return (
    <StatusNotice
      tone="neutral"
      icon="clock"
      title="Leilão encerrado"
      message="Este item não aceita mais lances e permanece disponível apenas para consulta."
      className="p-5 shadow-sm"
    />
  );
}

interface UseAuctionRealtimeStateInput {
  auction: AuctionDto | undefined;
  auctionId: string;
  refetchAuction: () => Promise<unknown>;
}

function useAuctionRealtimeState({
  auction,
  auctionId,
  refetchAuction,
}: UseAuctionRealtimeStateInput) {
  const [isExpired, setIsExpired] = useState(false);
  const [currentEndsAt, setCurrentEndsAt] = useState<string | null>(null);
  const [showExtensionNotice, setShowExtensionNotice] = useState(false);

  const { extendedPayload, newBidPayload, clearExtension, clearNewBid } = useAuctionRoom(auctionId);

  useEffect(() => {
    if (!extendedPayload) {
      return;
    }

    setCurrentEndsAt(extendedPayload.newEndsAt);
    setShowExtensionNotice(true);

    const timeout = setTimeout(() => {
      setShowExtensionNotice(false);
    }, 5000);

    clearExtension();

    return () => clearTimeout(timeout);
  }, [extendedPayload, clearExtension]);

  useEffect(() => {
    if (!newBidPayload) {
      return;
    }

    void refetchAuction();
    clearNewBid();
  }, [newBidPayload, refetchAuction, clearNewBid]);

  useEffect(() => {
    if (auction && !currentEndsAt) {
      setCurrentEndsAt(auction.endsAt);
    }
  }, [auction, currentEndsAt]);

  return {
    currentEndsAt,
    isExpired,
    setIsExpired,
    showExtensionNotice,
  };
}

export function AuctionDetailPage() {
  const { auctionId = "" } = useParams();
  const { isAuthenticated, user } = useAuth();
  const auctionQuery = useAuction(auctionId);
  const placeBidMutation = usePlaceBid(auctionId);
  const closeAuctionMutation = useCloseAuction(auctionId);
  const uploadImagesMutation = useUploadImages(auctionId);
  const deleteImageMutation = useDeleteImage(auctionId);
  const reorderImagesMutation = useReorderImages(auctionId);
  const submitAuctionEditMutation = useSubmitAuctionEdit(auctionId);

  const { currentEndsAt, isExpired, setIsExpired, showExtensionNotice } = useAuctionRealtimeState({
    auction: auctionQuery.data,
    auctionId,
    refetchAuction: () => auctionQuery.refetch(),
  });

  const [bidAmount, setBidAmount] = useState("");
  const [titleEditValue, setTitleEditValue] = useState("");
  const [descriptionEditValue, setDescriptionEditValue] = useState("");
  const [editRequestSuccessMessage, setEditRequestSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!auctionQuery.data) {
      return;
    }

    setTitleEditValue(auctionQuery.data.title);
    setDescriptionEditValue(auctionQuery.data.description ?? "");
  }, [auctionId, auctionQuery.data]);

  const minBid = useMemo(() => {
    if (!auctionQuery.data) {
      return 1;
    }
    return auctionQuery.data.highestBid + 1;
  }, [auctionQuery.data]);

  const isOwner = useMemo(() => {
    if (!auctionQuery.data || !user) return false;
    return auctionQuery.data.sellerId === user.id;
  }, [auctionQuery.data, user]);

  async function handlePlaceBid(event: SyntheticEvent<HTMLFormElement, Event>) {
    event.preventDefault();
    await placeBidMutation.mutateAsync({ amount: Number(bidAmount) });
    setBidAmount("");
  }

  async function handleCloseAuction() {
    await closeAuctionMutation.mutateAsync();
  }

  async function handleUploadImages(files: File[]): Promise<ImageDto[]> {
    const result = await uploadImagesMutation.mutateAsync(files);
    void auctionQuery.refetch();
    return result;
  }

  async function handleDeleteImage(imageId: string): Promise<void> {
    await deleteImageMutation.mutateAsync(imageId);
    void auctionQuery.refetch();
  }

  async function handleSubmitTitleEdit() {
    const title = titleEditValue.trim();

    setEditRequestSuccessMessage(null);
    await submitAuctionEditMutation.mutateAsync({ editType: "TITLE", title });
    setEditRequestSuccessMessage("Solicitação de alteração de título enviada para revisão.");
  }

  async function handleSubmitDescriptionEdit() {
    setEditRequestSuccessMessage(null);
    await submitAuctionEditMutation.mutateAsync({
      editType: "DESCRIPTION",
      description: descriptionEditValue.trim() || null,
    });
    setEditRequestSuccessMessage("Solicitação de alteração de descrição enviada para revisão.");
  }

  function handleImagesChange(updatedImages: ImageDto[]): void {
    const positions = updatedImages.map((img, index) => ({
      id: img.id,
      position: index,
      isPrimary: img.isPrimary,
    }));
    void reorderImagesMutation.mutateAsync(positions);
  }

  if (auctionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-amber-600" />
          <p className="text-sm text-slate-600">Carregando leilão...</p>
        </div>
      </div>
    );
  }

  if (auctionQuery.isError || !auctionQuery.data) {
    return (
      <Alert variant="error">
        {getErrorMessage(auctionQuery.error, "Não foi possível carregar o leilão")}{" "}
        <Link to="/auctions">Voltar</Link>
      </Alert>
    );
  }

  const auction = auctionQuery.data;
  const displayEndsAt = currentEndsAt || auction.endsAt;
  const isAuctionExpired = isExpired || new Date(displayEndsAt).getTime() <= Date.now();
  const images: ImageDto[] = auction.images ?? [];
  const normalizedCurrentDescription = (auction.description ?? "").trim();
  const normalizedDescriptionEditValue = descriptionEditValue.trim();
  const isTitleEditChanged = titleEditValue.trim() !== auction.title;
  const isDescriptionEditChanged = normalizedDescriptionEditValue !== normalizedCurrentDescription;
  const isAuctionOpen = auction.status === "OPEN" && !isAuctionExpired;
  const statusBadge = getAuctionStatusBadge(auction.status, isAuctionOpen);

  return (
    <div className="space-y-6">
      {/* Extension notice banner */}
      {showExtensionNotice && (
        <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 animate-extension-slide">
          <span className="relative flex h-3 w-3 flex-shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-rose-500" />
          </span>
          <span className="text-sm font-medium text-rose-800">
            Leilão prorrogado! Novo tempo adicionado devido ao anti-sniping.
          </span>
        </div>
      )}

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
        {/* Left: Image carousel - takes 7 columns on large screens */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-6">
            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
              <ImageCarousel images={images} className="w-full" />
            </div>

            {/* Image uploader for owner */}
            {isOwner && (
              <Card className="mt-4">
                <h3 className="mb-3 text-lg font-semibold text-slate-900">Gerenciar imagens</h3>
                <ImageUploader
                  images={images}
                  onChange={handleImagesChange}
                  onUpload={handleUploadImages}
                  onDelete={handleDeleteImage}
                  maxImages={10}
                  maxSizeMB={10}
                  uploadProgress={uploadImagesMutation.progress}
                  isUploading={uploadImagesMutation.isUploading}
                />
              </Card>
            )}

            {isOwner && (
              <Card className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Solicitar edição do leilão</h3>
                  <p className="mt-1 text-sm text-slate-600">
                    Envie alterações de título ou descrição para revisão administrativa.
                  </p>
                </div>

                {submitAuctionEditMutation.isError ? (
                  <Alert variant="error">
                    {getErrorMessage(
                      submitAuctionEditMutation.error,
                      "Não foi possível enviar a solicitação de edição"
                    )}
                  </Alert>
                ) : null}

                {editRequestSuccessMessage ? (
                  <Alert variant="success">{editRequestSuccessMessage}</Alert>
                ) : null}

                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <Label htmlFor="edit-title">Novo título</Label>
                    <Input
                      id="edit-title"
                      value={titleEditValue}
                      onChange={(event) => setTitleEditValue(event.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    disabled={!isTitleEditChanged || submitAuctionEditMutation.isPending}
                    onClick={() => {
                      void handleSubmitTitleEdit();
                    }}
                  >
                    {submitAuctionEditMutation.isPending ? "Enviando..." : "Solicitar alteração de título"}
                  </Button>
                </div>

                <div className="space-y-3 rounded-xl border border-slate-200 p-4">
                  <div>
                    <Label htmlFor="edit-description">Nova descrição</Label>
                    <textarea
                      id="edit-description"
                      className="mt-1.5 min-h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-hidden transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                      value={descriptionEditValue}
                      onChange={(event) => setDescriptionEditValue(event.target.value)}
                    />
                  </div>

                  <Button
                    type="button"
                    disabled={!isDescriptionEditChanged || submitAuctionEditMutation.isPending}
                    onClick={() => {
                      void handleSubmitDescriptionEdit();
                    }}
                  >
                    {submitAuctionEditMutation.isPending ? "Enviando..." : "Solicitar alteração de descrição"}
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Right: Auction details - takes 5 columns on large screens */}
        <div className="space-y-6 lg:col-span-5">
          {/* Auction info card */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
            {/* Title and status */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold leading-tight text-slate-900">{auction.title}</h1>
              <Badge variant={statusBadge.variant} className="flex-shrink-0">
                {statusBadge.label}
              </Badge>
            </div>

            {/* Hero countdown - most prominent */}
            <div className="mb-6">
              <AuctionStatusHero
                displayEndsAt={displayEndsAt}
                isAuctionOpen={isAuctionOpen}
                onExpire={() => setIsExpired(true)}
                rejectionReason={auction.rejectionReason}
                status={auction.status}
              />
            </div>

            {/* Description */}
            <p className="mb-6 text-slate-600 leading-relaxed">
              {auction.description ?? "Sem descrição cadastrada."}
            </p>

            {/* Price hierarchy */}
            <div className="grid grid-cols-2 gap-4 rounded-xl bg-stone-50 p-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lance inicial</p>
                <p className="price-display mt-1 text-lg text-slate-700">
                  {formatCurrency(auction.startingPrice)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Maior lance</p>
                <p className="price-display mt-1 text-2xl font-bold text-slate-900">
                  {formatCurrency(auction.highestBid)}
                </p>
              </div>
            </div>
          </div>

          {/* Bid card */}
          <AuctionActionPanel
            bidAmount={bidAmount}
            closeAuctionState={{
              error: closeAuctionMutation.error,
              isError: closeAuctionMutation.isError,
              isPending: closeAuctionMutation.isPending,
            }}
            isAuthenticated={isAuthenticated}
            isAuctionOpen={isAuctionOpen}
            isOwner={isOwner}
            minBid={minBid}
            onBidAmountChange={setBidAmount}
            onCloseAuction={() => {
              void handleCloseAuction();
            }}
            onSubmitBid={(event) => {
              void handlePlaceBid(event);
            }}
            placeBidState={{
              error: placeBidMutation.error,
              isError: placeBidMutation.isError,
              isPending: placeBidMutation.isPending,
              isSuccess: placeBidMutation.isSuccess,
            }}
            rejectionReason={auction.rejectionReason}
            status={auction.status}
          />
        </div>
      </div>
    </div>
  );
}
