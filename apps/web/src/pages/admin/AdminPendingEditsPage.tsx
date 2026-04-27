import type { PendingAuctionEditDto } from "@auction/shared-types";
import { Alert, Badge, Button, Card, Input } from "@auction/ui";
import { type ChangeEvent, useState } from "react";

import {
  useApprovePendingEdit,
  usePendingEdits,
  useRejectPendingEdit,
} from "@/features/admin/hooks/usePendingEdits";
import { getErrorMessage } from "@/shared/api/get-error-message";

function getMutationErrorMessage(args: {
  approveError: unknown;
  isApproveError: boolean;
  rejectError: unknown;
  isRejectError: boolean;
}) {
  if (args.isApproveError) {
    return getErrorMessage(args.approveError, "Não foi possível aprovar a edição");
  }

  if (args.isRejectError) {
    return getErrorMessage(args.rejectError, "Não foi possível rejeitar a edição");
  }

  return null;
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function renderValue(value: Record<string, unknown> | null) {
  if (!value) {
    return "Sem valor anterior";
  }

  return JSON.stringify(value, null, 2);
}

export function AdminPendingEditsPage() {
  const [page, setPage] = useState(1);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const pendingEditsQuery = usePendingEdits(page);
  const approveEditMutation = useApprovePendingEdit();
  const rejectEditMutation = useRejectPendingEdit();

  const edits = pendingEditsQuery.data?.data ?? [];
  const pagination = pendingEditsQuery.data?.pagination;
  const mutationErrorMessage = getMutationErrorMessage({
    approveError: approveEditMutation.error,
    isApproveError: approveEditMutation.isError,
    rejectError: rejectEditMutation.error,
    isRejectError: rejectEditMutation.isError,
  });

  const handleApprove = async (editId: string) => {
    if (!window.confirm("Tem certeza que deseja aprovar esta edição?")) {
      return;
    }

    await approveEditMutation.mutateAsync(editId);
  };

  const handleReject = async (editId: string) => {
    if (!rejectReason.trim()) {
      window.alert("Por favor, forneça um motivo para a rejeição.");
      return;
    }

    await rejectEditMutation.mutateAsync({ editId, reason: rejectReason });
    setRejectingId(null);
    setRejectReason("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Edições pendentes de revisão</h1>
        <p className="text-sm text-slate-500">
          Aprove ou rejeite alterações de leilões enviadas para revisão administrativa.
        </p>
      </div>

      {pendingEditsQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(pendingEditsQuery.error, "Não foi possível carregar as edições pendentes")}
        </Alert>
      ) : null}

      {mutationErrorMessage ? (
        <Alert variant="error">
          {mutationErrorMessage}
        </Alert>
      ) : null}

      {edits.length === 0 && !pendingEditsQuery.isLoading ? (
        <Card className="p-6">
          <p className="text-center text-slate-500">Nenhuma edição pendente de revisão.</p>
        </Card>
      ) : null}

      {pendingEditsQuery.isLoading ? (
        <Card className="p-6">
          <p className="text-center text-slate-500">Carregando edições pendentes...</p>
        </Card>
      ) : null}

      <div className="space-y-4">
        {edits.map((edit: PendingAuctionEditDto) => (
          <Card key={edit.id} className="p-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold">{edit.auctionTitle}</h2>
                  <Badge variant="neutral">{edit.editType}</Badge>
                </div>

                <div className="text-sm text-slate-500">
                  <p>
                    <strong>Enviado por:</strong> {edit.submittedByName} ({edit.submittedByEmail})
                  </p>
                  <p>
                    <strong>Criado em:</strong> {formatDateTime(edit.createdAt)}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700">Valor anterior</p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      {renderValue(edit.oldValue)}
                    </pre>
                  </div>

                  <div>
                    <p className="mb-1 text-sm font-medium text-slate-700">Novo valor</p>
                    <pre className="overflow-x-auto rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                      {renderValue(edit.newValue)}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 md:min-w-48">
                {rejectingId === edit.id ? (
                  <>
                    <Input
                      placeholder="Motivo da rejeição"
                      value={rejectReason}
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setRejectReason(event.target.value)}
                    />

                    <Button
                      onClick={() => {
                        void handleReject(edit.id);
                      }}
                      disabled={rejectEditMutation.isPending}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar rejeição
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
                  </>
                ) : (
                  <>
                    <Button
                      onClick={() => {
                        void handleApprove(edit.id);
                      }}
                      disabled={approveEditMutation.isPending}
                    >
                      Aprovar edição
                    </Button>

                    <Button
                      variant="secondary"
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => setRejectingId(edit.id)}
                    >
                      Rejeitar edição
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>

          <span className="px-4 py-2 text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            onClick={() => setPage((currentPage) => Math.min(pagination.totalPages, currentPage + 1))}
            disabled={page === pagination.totalPages}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </div>
  );
}