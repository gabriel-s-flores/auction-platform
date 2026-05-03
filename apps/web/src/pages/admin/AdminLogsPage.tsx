import type { ActionType, ActivityLogDto, ListActivityLogsQuery } from "@auction/shared-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  CustomDatePicker,
  FormField,
  Input,
  Pagination,
  Select,
  StateMessage,
} from "@auction/ui";
import { useState } from "react";

import { useActivityLogs, useExportActivityLogs } from "@/features/admin/hooks/useActivityLogs";
import { getErrorMessage } from "@/shared/api/get-error-message";

const ACTION_OPTIONS: Array<{ label: string; value: ActionType }> = [
  { label: "Login de usuário", value: "USER_LOGIN" },
  { label: "Logout de usuário", value: "USER_LOGOUT" },
  { label: "Falha no login", value: "LOGIN_FAILED" },
  { label: "Leilão criado", value: "AUCTION_CREATED" },
  { label: "Leilão aprovado", value: "AUCTION_APPROVED" },
  { label: "Leilão rejeitado", value: "AUCTION_REJECTED" },
  { label: "Leilão encerrado", value: "AUCTION_CLOSED" },
  { label: "Leilão cancelado", value: "AUCTION_CANCELLED" },
  { label: "Edição enviada", value: "EDIT_SUBMITTED" },
  { label: "Edição aprovada", value: "EDIT_APPROVED" },
  { label: "Edição rejeitada", value: "EDIT_REJECTED" },
  { label: "Lance realizado", value: "BID_PLACED" },
  { label: "Lance superado", value: "BID_OUTBID" },
  { label: "Admin criado", value: "ADMIN_CREATED" },
  { label: "Admin removido", value: "ADMIN_REMOVED" },
  { label: "Usuário banido", value: "USER_BANNED" },
  { label: "Usuário desbanido", value: "USER_UNBANNED" },
  { label: "Imagem enviada", value: "IMAGE_UPLOADED" },
  { label: "Imagem deletada", value: "IMAGE_DELETED" },
];

type ActivityLogsFiltersForm = {
  action: "" | ActionType;
  entityType: string;
  actorId: string;
  startDate: string;
  endDate: string;
};

const INITIAL_FILTERS: ActivityLogsFiltersForm = {
  action: "",
  entityType: "",
  actorId: "",
  startDate: "",
  endDate: "",
};

function buildQueryFromFilters(filters: ActivityLogsFiltersForm): Omit<ListActivityLogsQuery, "page" | "limit"> {
  return {
    action: filters.action || undefined,
    entityType: filters.entityType || undefined,
    actorId: filters.actorId || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
  };
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getActionVariant(action: ActionType): "neutral" | "success" | "danger" {
  if (
    action === "AUCTION_APPROVED" ||
    action === "EDIT_APPROVED" ||
    action === "USER_UNBANNED" ||
    action === "USER_LOGIN"
  ) {
    return "success";
  }

  if (
    action === "AUCTION_REJECTED" ||
    action === "EDIT_REJECTED" ||
    action === "LOGIN_FAILED" ||
    action === "USER_BANNED"
  ) {
    return "danger";
  }

  return "neutral";
}

function downloadLogs(payload: unknown, exportedAt: string) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `activity-logs-${exportedAt.replaceAll(":", "-")}.json`;
  link.click();

  URL.revokeObjectURL(url);
}

function MetadataPreview({ metadata }: { metadata: ActivityLogDto["metadata"] }) {
  if (!metadata) {
    return <span className="text-slate-400">Sem metadata</span>;
  }

  return (
    <details className="rounded-lg bg-slate-50 px-3 py-2">
      <summary className="cursor-pointer text-sm font-medium text-slate-700">Ver metadata</summary>
      <pre className="mt-2 overflow-x-auto text-xs text-slate-600">
        {JSON.stringify(metadata, null, 2)}
      </pre>
    </details>
  );
}

export function AdminLogsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<ActivityLogsFiltersForm>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<Omit<ListActivityLogsQuery, "page" | "limit">>({});

  const logsQuery = useActivityLogs({ page, limit: 20, ...appliedFilters });
  const exportLogsMutation = useExportActivityLogs();

  const logs = logsQuery.data?.data ?? [];
  const pagination = logsQuery.data?.pagination;

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(buildQueryFromFilters(filters));
  };

  const handleClearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setPage(1);
    setAppliedFilters({});
  };

  const handleExport = async () => {
    const result = await exportLogsMutation.mutateAsync(appliedFilters);
    downloadLogs(result, result.exportedAt);
  };

  const logsContent = (() => {
    if (logsQuery.isLoading) {
      return <StateMessage>Carregando logs...</StateMessage>;
    }

    if (logs.length === 0) {
      return (
        <StateMessage>
          Nenhum log encontrado para os filtros aplicados.
        </StateMessage>
      );
    }

    return (
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="rounded-lg border border-slate-200 p-4">
            <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getActionVariant(log.action)}>{log.action}</Badge>
                <span className="text-sm text-slate-500">{log.entityType}</span>
              </div>
              <span className="text-sm text-slate-500">{formatDateTime(log.createdAt)}</span>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="font-medium text-slate-900">Entity ID</p>
                <p className="break-all">{log.entityId}</p>
              </div>

              <div>
                <p className="font-medium text-slate-900">Ator</p>
                <p>{log.actorName ?? "Sistema"}</p>
                <p className="text-slate-500">{log.actorEmail ?? log.actorId ?? "Sem identificação"}</p>
              </div>

              <div>
                <p className="font-medium text-slate-900">IP</p>
                <p>{log.ipAddress ?? "Não informado"}</p>
              </div>

              <div>
                <p className="font-medium text-slate-900">Metadata</p>
                <MetadataPreview metadata={log.metadata} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  })();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs de atividade</h1>
        <p className="text-sm text-slate-500">
          Consulte eventos administrativos e operacionais registrados na plataforma.
        </p>
      </div>

      <Card className="p-6">
        <form
          className="space-y-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
            <FormField id="activity-log-action" label="Ação">
              <Select
                id="activity-log-action"
                value={filters.action}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    action: event.target.value as ActivityLogsFiltersForm["action"],
                  }))
                }
              >
                <option value="">Todas</option>
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField id="activity-log-entity-type" label="Entidade">
              <Input
                id="activity-log-entity-type"
                placeholder="auction, user, edit..."
                value={filters.entityType}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, entityType: event.target.value }))
                }
              />
            </FormField>

            <FormField id="activity-log-actor-id" label="Actor ID">
              <Input
                id="activity-log-actor-id"
                placeholder="UUID do ator"
                value={filters.actorId}
                onChange={(event) =>
                  setFilters((current) => ({ ...current, actorId: event.target.value }))
                }
              />
            </FormField>

            <FormField id="activity-log-start-date" label="Data inicial">
              <CustomDatePicker
                id="activity-log-start-date"
                value={filters.startDate}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, startDate: value }))
                }
              />
            </FormField>

            <FormField id="activity-log-end-date" label="Data final">
              <CustomDatePicker
                id="activity-log-end-date"
                value={filters.endDate}
                onChange={(value) =>
                  setFilters((current) => ({ ...current, endDate: value }))
                }
              />
            </FormField>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Aplicar filtros</Button>
            <Button type="button" variant="secondary" onClick={handleClearFilters}>
              Limpar
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleExport();
              }}
              disabled={exportLogsMutation.isPending}
            >
              {exportLogsMutation.isPending ? "Exportando..." : "Exportar JSON"}
            </Button>
          </div>
        </form>
      </Card>

      {logsQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(logsQuery.error, "Não foi possível carregar os logs")}
        </Alert>
      ) : null}

      {exportLogsMutation.error ? (
        <Alert variant="error">
          {getErrorMessage(exportLogsMutation.error, "Não foi possível exportar os logs")}
        </Alert>
      ) : null}

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Resultados</h2>
            <p className="text-sm text-slate-500">
              {pagination ? `${pagination.total} evento(s) encontrado(s)` : "Carregando contagem..."}
            </p>
          </div>
        </div>

        {logsContent}

        {pagination ? (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={setPage}
          />
        ) : null}
      </Card>
    </div>
  );
}
