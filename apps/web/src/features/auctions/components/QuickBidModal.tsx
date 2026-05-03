import type { AuctionDto } from "@auction/shared-types";
import { Alert, Button, FieldError, Input, Label } from "@auction/ui";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import type { FormEvent, MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { usePlaceBid } from "@/features/auctions/hooks/usePlaceBid";
import { getErrorMessage } from "@/shared/api/get-error-message";

type QuickBidModalProps = {
  auction: AuctionDto;
  isOwner: boolean;
  isOpen: boolean;
  onClose: () => void;
  submitBid?: (input: { amount: number; auctionId: string }) => Promise<void>;
  onViewDetails: () => void;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    currency: "BRL",
    minimumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

function getPrimaryImageUrl(auction: AuctionDto) {
  const primaryImage = auction.images?.find((image) => image.isPrimary) ?? auction.images?.[0];

  return primaryImage?.thumbnailUrl || primaryImage?.url || null;
}

function getConflictAwareMessage(error: unknown) {
  if (axios.isAxiosError(error) && error.response?.status === 409) {
    return "Outro participante acabou de enviar um lance maior. Revise o valor mínimo e tente novamente.";
  }

  return getErrorMessage(error, "Não foi possível enviar o lance. Tente novamente.");
}

function shouldRefreshAuctionData(error: unknown) {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  return [400, 409].includes(error.response?.status ?? 0);
}

export function QuickBidModal({
  auction,
  isOwner,
  isOpen,
  onClose,
  submitBid,
  onViewDetails,
}: QuickBidModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const previousAuctionIdRef = useRef<string | null>(null);
  const queryClient = useQueryClient();
  const placeBidMutation = usePlaceBid(auction.id);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState<string | undefined>();
  const [submissionError, setSubmissionError] = useState<string | undefined>();
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);
  const [injectedSubmitPending, setInjectedSubmitPending] = useState(false);
  const [localHighestBid, setLocalHighestBid] = useState(auction.highestBid);

  const isSubmittingBid = placeBidMutation.isPending || injectedSubmitPending;
  const isAuctionExpired = new Date(auction.endsAt).getTime() <= Date.now();
  const isAuctionUnavailable = auction.status !== "OPEN" || isAuctionExpired;
  const minBid = localHighestBid + 1;
  const thumbnailUrl = getPrimaryImageUrl(auction);

  const suggestedBids = useMemo(() => {
    return Array.from(new Set([minBid, minBid + 10, minBid + 50, minBid + 100]));
  }, [minBid]);

  useEffect(() => {
    if (!isOpen) {
      previousAuctionIdRef.current = null;
      return;
    }

    if (previousAuctionIdRef.current === auction.id) {
      return;
    }

    previousAuctionIdRef.current = auction.id;
    setBidError(undefined);
    setSubmissionError(undefined);
    setConfirmedAmount(null);
    setLocalHighestBid(auction.highestBid);
    setBidAmount(String(auction.highestBid + 1));
  }, [auction.highestBid, auction.id, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLocalHighestBid((currentHighestBid) => Math.max(currentHighestBid, auction.highestBid));
  }, [auction.highestBid, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setBidAmount((currentAmount) => {
      const parsedAmount = Number(currentAmount);

      if (!Number.isFinite(parsedAmount) || parsedAmount < minBid) {
        return String(minBid);
      }

      return currentAmount;
    });
  }, [isOpen, minBid]);

  useEffect(() => {
    if (!isOpen || !contentRef.current) {
      return;
    }

    const container = contentRef.current;
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      ),
    );

    if (focusableElements.length === 0) {
      return;
    }

    const firstElement = focusableElements[0]!;
    const lastElement = focusableElements[focusableElements.length - 1]!;

    firstElement.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isSubmittingBid) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSubmittingBid, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget && !isSubmittingBid) {
        onClose();
      }
    },
    [isSubmittingBid, onClose],
  );

  function validateAmount() {
    const amount = Number(bidAmount);

    if (isOwner) {
      return "Você não pode dar lance no próprio leilão.";
    }

    if (isAuctionUnavailable) {
      return "Este leilão não está mais aceitando lances.";
    }

    if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount < minBid) {
      return `Informe um lance de pelo menos ${formatCurrency(minBid)}.`;
    }

    return undefined;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationError = validateAmount();

    if (validationError) {
      setBidError(validationError);
      setSubmissionError(undefined);
      return;
    }

    const amount = Number(bidAmount);

    try {
      setBidError(undefined);
      setSubmissionError(undefined);

      if (submitBid) {
        setInjectedSubmitPending(true);
        await submitBid({ amount, auctionId: auction.id });
      } else {
        await placeBidMutation.mutateAsync({ amount });
      }

      setConfirmedAmount(amount);
      setLocalHighestBid(amount);
      setBidAmount(String(amount + 1));
    } catch (error) {
      setConfirmedAmount(null);
      setSubmissionError(getConflictAwareMessage(error));

      if (shouldRefreshAuctionData(error)) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ["auctions", "open"] }),
          queryClient.invalidateQueries({ queryKey: ["auction", auction.id] }),
        ]);
      }
    } finally {
      setInjectedSubmitPending(false);
    }
  }

  function handleSuggestedBid(amount: number) {
    setBidAmount(String(amount));
    setBidError(undefined);
    setSubmissionError(undefined);
  }

  function handleClose() {
    if (!isSubmittingBid) {
      onClose();
    }
  }

  const unavailableMessage = isOwner
    ? "Vendedores não podem dar lances em seus próprios leilões."
    : "Este leilão não está mais aceitando lances.";

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          aria-hidden={!isOpen}
          className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={handleBackdropClick}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            ref={contentRef}
            aria-describedby="quick-bid-summary"
            aria-labelledby="quick-bid-title"
            aria-modal="true"
            className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
            role="dialog"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.18 }}
          >
            <div className="h-1.5 w-full bg-amber-500" />
            <div className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-amber-700">Lance rápido</p>
                  <h2 id="quick-bid-title" className="mt-1 text-xl font-semibold text-slate-900">
                    Confirmar lance
                  </h2>
                </div>
                <button
                  aria-label="Fechar"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isSubmittingBid}
                  onClick={handleClose}
                  type="button"
                >
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div id="quick-bid-summary" className="mt-5 flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-stone-100">
                  {thumbnailUrl ? (
                    <img alt="" className="h-full w-full object-cover" src={thumbnailUrl} />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-slate-400">
                      Sem imagem
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-base font-semibold text-slate-900">
                    {auction.title}
                  </h3>
                  <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <dt className="text-slate-500">Maior lance</dt>
                      <dd className="font-semibold text-slate-900">
                        {formatCurrency(localHighestBid)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Lance mínimo</dt>
                      <dd className="font-semibold text-amber-700">{formatCurrency(minBid)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {confirmedAmount ? (
                  <Alert variant="success">
                    Lance de {formatCurrency(confirmedAmount)} enviado com sucesso.
                  </Alert>
                ) : null}

                {submissionError ? <Alert variant="error">{submissionError}</Alert> : null}

                {(isOwner || isAuctionUnavailable) && !submissionError ? (
                  <Alert variant="error">{unavailableMessage}</Alert>
                ) : null}
              </div>

              <form
                className="mt-5 space-y-4"
                noValidate
                onSubmit={(event) => void handleSubmit(event)}
              >
                <div>
                  <Label htmlFor="quick-bid-amount">Valor do lance</Label>
                  <div className="relative mt-1.5">
                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                      R$
                    </span>
                    <Input
                      aria-describedby={
                        bidError
                          ? "quick-bid-amount-error quick-bid-minimum-help"
                          : "quick-bid-minimum-help"
                      }
                      aria-invalid={Boolean(bidError)}
                      className="pl-8"
                      disabled={isSubmittingBid || isOwner || isAuctionUnavailable}
                      id="quick-bid-amount"
                      inputMode="numeric"
                      min={minBid}
                      onChange={(event) => {
                        setBidAmount(event.target.value);
                        setBidError(undefined);
                        setSubmissionError(undefined);
                      }}
                      step={1}
                      type="number"
                      value={bidAmount}
                    />
                  </div>
                  <p id="quick-bid-minimum-help" className="mt-1.5 text-xs text-slate-500">
                    Lance mínimo atual:{" "}
                    <span className="font-medium">{formatCurrency(minBid)}</span>
                  </p>
                  <FieldError id="quick-bid-amount-error">{bidError}</FieldError>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {suggestedBids.map((amount, index) => (
                    <button
                      key={amount}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isSubmittingBid || isOwner || isAuctionUnavailable}
                      onClick={() => handleSuggestedBid(amount)}
                      type="button"
                    >
                      {index === 0 ? "Mínimo" : formatCurrency(amount)}
                    </button>
                  ))}
                </div>

                <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  Lances confirmados não podem ser cancelados. Confira o valor antes de enviar.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <Button
                    className="w-full sm:w-auto"
                    disabled={isSubmittingBid}
                    onClick={onViewDetails}
                    type="button"
                    variant="secondary"
                  >
                    Ver detalhes
                  </Button>
                  <Button
                    className="w-full py-2.5 font-semibold disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                    disabled={isSubmittingBid || isOwner || isAuctionUnavailable}
                    type="submit"
                  >
                    {isSubmittingBid ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Enviando lance...
                      </span>
                    ) : (
                      "Confirmar lance"
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
