import type { PendingAuctionDto } from "@auction/shared-types";
import { Alert, Button, Card, Input, Pagination, StateMessage } from "@auction/ui";
import { type ChangeEvent, useState } from "react";

import { useApproveAuction, usePendingAuctions, useRejectAuction } from "@/features/admin/hooks/usePendingAuctions";
import { alert, confirm } from "@/shared/modal";

export function AdminPendingAuctionsPage() {
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading, error } = usePendingAuctions(page);
  const approveMutation = useApproveAuction();
  const rejectMutation = useRejectAuction();

  const handleApprove = async (auctionId: string) => {
    const userConfirmed = await confirm("Tem certeza que deseja aprovar este leilão?", {
      title: "Aprovar leilão",
    });

    if (!userConfirmed) {
      return;
    }

    await approveMutation.mutateAsync(auctionId);
  };

  const handleReject = async (auctionId: string) => {
    if (!rejectReason.trim()) {
      await alert("Por favor, forneça um motivo para a rejeição.");
      return;
    }

    await rejectMutation.mutateAsync({ auctionId, reason: rejectReason });
    setRejectingId(null);
    setRejectReason("");
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Leilões Pendentes de Aprovação</h1>
        <StateMessage>Carregando leilões pendentes...</StateMessage>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Leilões Pendentes de Aprovação</h1>
        <Alert variant="error">Erro ao carregar leilões pendentes</Alert>
      </div>
    );
  }

  const auctions = data?.data ?? [];
  const totalPages = data?.pagination.totalPages ?? 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Leilões Pendentes de Aprovação</h1>

      {auctions.length === 0 ? (
        <Card className="p-6">
          <StateMessage className="py-0">Nenhum leilão pendente de aprovação</StateMessage>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {auctions.map((auction: PendingAuctionDto) => (
              <Card key={auction.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">{auction.title}</h2>

                    {auction.description ? (
                      <p className="mt-1 text-gray-600">{auction.description}</p>
                    ) : null}

                    <div className="mt-2 text-sm text-gray-500">
                      <p>
                        <strong>Vendedor:</strong> {auction.sellerName} ({auction.sellerEmail})
                      </p>
                      <p>
                        <strong>Preço Inicial:</strong> R$ {(auction.startingPrice / 100).toFixed(2)}
                      </p>
                      <p>
                        <strong>Criado em:</strong> {new Date(auction.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 flex gap-2">
                    {rejectingId === auction.id ? (
                      <div className="flex flex-col gap-2">
                        <Input
                          placeholder="Motivo da rejeição"
                          value={rejectReason}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => setRejectReason(event.target.value)}
                        />

                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            onClick={() => {
                              void handleReject(auction.id);
                            }}
                            disabled={rejectMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Confirmar Rejeição
                          </Button>

                          <Button
                            variant="secondary"
                            onClick={() => {
                              setRejectingId(null);
                              setRejectReason("");
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Button
                          variant="primary"
                          onClick={() => {
                            void handleApprove(auction.id);
                          }}
                          disabled={approveMutation.isPending}
                        >
                          Aprovar
                        </Button>

                        <Button
                          variant="secondary"
                          onClick={() => setRejectingId(auction.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
