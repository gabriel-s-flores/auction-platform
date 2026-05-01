import type {
  AuctionStatus,
  PaginationMeta,
  UserAuctionListItemDto,
  UserBidActivityDto,
  UserBidActivityStatus,
  UserDashboardSummaryDto,
  UserEditStatus,
  UserPendingEditDto,
  UserWinDto,
} from "@auction/shared-types";
import { Alert, Badge, Button, Card, staggerContainerCards } from "@auction/ui";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useCloseAuction } from "@/features/auctions/hooks/useCloseAuction";
import {
  useUserAuctions,
  useUserBids,
  useUserDashboard,
  useUserPendingEdits,
  useUserWins,
} from "@/features/user-panel/hooks/useUserPanel";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { confirm } from "@/shared/modal";

type StatusBadgeVariant = "neutral" | "success" | "danger";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getAuctionStatusLabel(status: AuctionStatus) {
  switch (status) {
    case "OPEN":
      return "Aberto";
    case "CLOSED":
      return "Encerrado";
    case "PENDING_APPROVAL":
      return "Pendente";
    case "REJECTED":
      return "Rejeitado";
    default:
      return status;
  }
}

function getAuctionStatusVariant(status: AuctionStatus): StatusBadgeVariant {
  switch (status) {
    case "OPEN":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

function getBidActivityLabel(status: UserBidActivityStatus) {
  switch (status) {
    case "LEADING":
      return "Liderando";
    case "OUTBID":
      return "Ultrapassado";
    case "WON":
      return "Arrematado";
    case "LOST":
      return "Não venceu";
    default:
      return status;
  }
}

function getBidActivityVariant(status: UserBidActivityStatus): StatusBadgeVariant {
  switch (status) {
    case "LEADING":
    case "WON":
      return "success";
    case "OUTBID":
    case "LOST":
      return "danger";
    default:
      return "neutral";
  }
}

function getEditStatusLabel(status: UserEditStatus) {
  switch (status) {
    case "PENDING_APPROVAL":
      return "Pendente";
    case "APPROVED":
      return "Aprovada";
    case "REJECTED":
      return "Rejeitada";
    default:
      return status;
  }
}

function getEditStatusVariant(status: UserEditStatus): StatusBadgeVariant {
  switch (status) {
    case "APPROVED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

function SummaryCard({ label, value, hint }: { label: string; value: number | string; hint: string }) {
  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Card>
  );
}

function PaginationControls({
  pagination,
  onPrevious,
  onNext,
}: {
  pagination: PaginationMeta | undefined;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (!pagination || pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-4 flex items-center justify-end gap-2">
      <Button variant="secondary" onClick={onPrevious} disabled={pagination.page <= 1} type="button">
        Anterior
      </Button>
      <span className="text-sm text-slate-500">
        Página {pagination.page} de {pagination.totalPages}
      </span>
      <Button
        variant="secondary"
        onClick={onNext}
        disabled={pagination.page >= pagination.totalPages}
        type="button"
      >
        Próxima
      </Button>
    </div>
  );
}

function SectionError({ error, fallbackMessage }: { error: unknown; fallbackMessage: string }) {
  return <Alert variant="error">{getErrorMessage(error, fallbackMessage)}</Alert>;
}

function EmptyState({ message }: { message: string }) {
  return <p className="py-6 text-center text-sm text-slate-500">{message}</p>;
}

function AuctionActions({ auction }: { auction: UserAuctionListItemDto }) {
  const closeAuctionMutation = useCloseAuction(auction.id);

  const handleCloseAuction = async () => {
    const userConfirmed = await confirm("Deseja encerrar este leilão agora?", {
      variant: "destructive",
      title: "Encerrar leilão",
    });

    if (!userConfirmed) {
      return;
    }

    await closeAuctionMutation.mutateAsync();
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Link to={`/auctions/${auction.id}`}>
        <Button variant="secondary" type="button">
          Ver detalhes
        </Button>
      </Link>

      {auction.status === "OPEN" ? (
        <Button onClick={() => void handleCloseAuction()} disabled={closeAuctionMutation.isPending} type="button">
          {closeAuctionMutation.isPending ? "Encerrando..." : "Encerrar agora"}
        </Button>
      ) : null}
    </div>
  );
}

function AccountOverview({ summary }: { summary: UserDashboardSummaryDto }) {
  return (
    <Card className="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Meu painel</h1>
          <p className="text-sm text-slate-500">
            Acompanhe seus leilões, arremates, lances e solicitações de edição.
          </p>
        </div>

        <Link to="/auctions/new">
          <Button type="button">Criar leilão</Button>
        </Link>
      </div>

      <motion.div
        className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={staggerContainerCards}
        initial="hidden"
        animate="visible"
      >
        <SummaryCard label="Leilões publicados" value={summary.totalAuctions} hint="Total cadastrado na sua conta" />
        <SummaryCard label="Leilões ativos" value={summary.activeAuctions} hint="Ainda aceitando lances" />
        <SummaryCard label="Arremates ganhos" value={summary.wonAuctions} hint="Leilões encerrados vencidos por você" />
        <SummaryCard
          label="Participações ativas"
          value={summary.activeBidParticipations}
          hint="Leilões abertos com lances seus"
        />
      </motion.div>

      <motion.div
        className="mt-6 grid gap-4 lg:grid-cols-3"
        variants={staggerContainerCards}
        initial="hidden"
        animate="visible"
      >
        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500">Conta</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{summary.profile.name}</p>
          <p className="text-sm text-slate-500">{summary.profile.email}</p>
          <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">Perfil: {summary.profile.role}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500">Moderação</p>
          <div className="mt-2 space-y-1 text-sm text-slate-700">
            <p>Pendentes de aprovação: {summary.pendingAuctions}</p>
            <p>Rejeitados: {summary.rejectedAuctions}</p>
            <p>Encerrados: {summary.closedAuctions}</p>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-medium text-slate-500">Ações rápidas</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to="/auctions/new">
              <Button type="button">Novo leilão</Button>
            </Link>
            <Link to="/auctions">
              <Button variant="secondary" type="button">
                Explorar leilões
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>
    </Card>
  );
}

function MyAuctionsSection({
  auctions,
  isLoading,
  error,
  pagination,
  status,
  onStatusChange,
  onPreviousPage,
  onNextPage,
}: {
  auctions: UserAuctionListItemDto[];
  isLoading: boolean;
  error: unknown;
  pagination: PaginationMeta | undefined;
  status: AuctionStatus | undefined;
  onStatusChange: (status: AuctionStatus | undefined) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const filters: Array<{ label: string; value: AuctionStatus | undefined }> = [
    { label: "Todos", value: undefined },
    { label: "Pendentes", value: "PENDING_APPROVAL" },
    { label: "Abertos", value: "OPEN" },
    { label: "Encerrados", value: "CLOSED" },
    { label: "Rejeitados", value: "REJECTED" },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Meus leilões</h2>
          <p className="text-sm text-slate-500">Gerencie os itens publicados e acompanhe o status de cada anúncio.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant={status === filter.value ? "primary" : "secondary"}
              onClick={() => onStatusChange(filter.value)}
              type="button"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? <SectionError error={error} fallbackMessage="Não foi possível carregar seus leilões" /> : null}
        {isLoading ? <EmptyState message="Carregando seus leilões..." /> : null}
        {!isLoading && !error && auctions.length === 0 ? (
          <EmptyState message="Você ainda não possui leilões nesse filtro." />
        ) : null}

        {!isLoading && !error
          ? auctions.map((auction) => (
              <div key={auction.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{auction.title}</h3>
                      <Badge variant={getAuctionStatusVariant(auction.status)}>
                        {getAuctionStatusLabel(auction.status)}
                      </Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
                      <p>Maior lance: {formatCurrency(auction.highestBid)}</p>
                      <p>Encerramento: {formatDate(auction.endsAt)}</p>
                      <p>Lances recebidos: {auction.bidsCount}</p>
                      <p>Publicado em: {formatDate(auction.createdAt)}</p>
                    </div>

                    {auction.rejectionReason ? (
                      <Alert variant="error">Motivo da rejeição: {auction.rejectionReason}</Alert>
                    ) : null}
                  </div>

                  <AuctionActions auction={auction} />
                </div>
              </div>
            ))
          : null}
      </div>

      <PaginationControls pagination={pagination} onPrevious={onPreviousPage} onNext={onNextPage} />
    </Card>
  );
}

function MyWinsSection({
  wins,
  isLoading,
  error,
  pagination,
  onPreviousPage,
  onNextPage,
}: {
  wins: UserWinDto[];
  isLoading: boolean;
  error: unknown;
  pagination: PaginationMeta | undefined;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Últimos arremates</h2>
        <p className="text-sm text-slate-500">Veja os leilões encerrados em que você foi o vencedor.</p>
      </div>

      <div className="space-y-4">
        {error ? <SectionError error={error} fallbackMessage="Não foi possível carregar seus arremates" /> : null}
        {isLoading ? <EmptyState message="Carregando seus arremates..." /> : null}
        {!isLoading && !error && wins.length === 0 ? (
          <EmptyState message="Você ainda não possui arremates concluídos." />
        ) : null}

        {!isLoading && !error
          ? wins.map((win) => (
              <div key={win.auctionId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-900">{win.title}</h3>
                    <p className="text-sm text-slate-500">Vendedor: {win.sellerName}</p>
                    <p className="text-sm text-slate-500">Encerrado em: {formatDate(win.endsAt)}</p>
                    <p className="text-sm font-medium text-emerald-700">Valor final: {formatCurrency(win.finalBid)}</p>
                  </div>

                  <Link to={`/auctions/${win.auctionId}`}>
                    <Button variant="secondary" type="button">
                      Ver detalhes
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          : null}
      </div>

      <PaginationControls pagination={pagination} onPrevious={onPreviousPage} onNext={onNextPage} />
    </Card>
  );
}

function MyBidsSection({
  bids,
  isLoading,
  error,
  pagination,
  status,
  onStatusChange,
  onPreviousPage,
  onNextPage,
}: {
  bids: UserBidActivityDto[];
  isLoading: boolean;
  error: unknown;
  pagination: PaginationMeta | undefined;
  status: UserBidActivityStatus | undefined;
  onStatusChange: (status: UserBidActivityStatus | undefined) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const filters: Array<{ label: string; value: UserBidActivityStatus | undefined }> = [
    { label: "Todos", value: undefined },
    { label: "Liderando", value: "LEADING" },
    { label: "Ultrapassado", value: "OUTBID" },
    { label: "Arrematados", value: "WON" },
    { label: "Perdidos", value: "LOST" },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Meus lances</h2>
          <p className="text-sm text-slate-500">Acompanhe sua posição em leilões ativos e encerrados.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant={status === filter.value ? "primary" : "secondary"}
              onClick={() => onStatusChange(filter.value)}
              type="button"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? <SectionError error={error} fallbackMessage="Não foi possível carregar seus lances" /> : null}
        {isLoading ? <EmptyState message="Carregando seus lances..." /> : null}
        {!isLoading && !error && bids.length === 0 ? (
          <EmptyState message="Você ainda não possui lances nesse filtro." />
        ) : null}

        {!isLoading && !error
          ? bids.map((bid) => (
              <div key={bid.auctionId} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{bid.title}</h3>
                      <Badge variant={getBidActivityVariant(bid.status)}>{getBidActivityLabel(bid.status)}</Badge>
                    </div>

                    <div className="grid gap-1 text-sm text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
                      <p>Status do leilão: {getAuctionStatusLabel(bid.auctionStatus)}</p>
                      <p>Vendedor: {bid.sellerName}</p>
                      <p>Seu maior lance: {formatCurrency(bid.userHighestBid)}</p>
                      <p>Maior lance atual: {formatCurrency(bid.highestBid)}</p>
                      <p>Quantidade de lances: {bid.userBidCount}</p>
                      <p>Encerramento: {formatDate(bid.auctionEndsAt)}</p>
                    </div>
                  </div>

                  <Link to={`/auctions/${bid.auctionId}`}>
                    <Button variant="secondary" type="button">
                      Abrir leilão
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          : null}
      </div>

      <PaginationControls pagination={pagination} onPrevious={onPreviousPage} onNext={onNextPage} />
    </Card>
  );
}

function MyEditsSection({
  edits,
  isLoading,
  error,
  pagination,
  status,
  onStatusChange,
  onPreviousPage,
  onNextPage,
}: {
  edits: UserPendingEditDto[];
  isLoading: boolean;
  error: unknown;
  pagination: PaginationMeta | undefined;
  status: UserEditStatus | undefined;
  onStatusChange: (status: UserEditStatus | undefined) => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  const filters: Array<{ label: string; value: UserEditStatus | undefined }> = [
    { label: "Todas", value: undefined },
    { label: "Pendentes", value: "PENDING_APPROVAL" },
    { label: "Aprovadas", value: "APPROVED" },
    { label: "Rejeitadas", value: "REJECTED" },
  ];

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Minhas solicitações de edição</h2>
          <p className="text-sm text-slate-500">Acompanhe as alterações enviadas para revisão administrativa.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <Button
              key={filter.label}
              variant={status === filter.value ? "primary" : "secondary"}
              onClick={() => onStatusChange(filter.value)}
              type="button"
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {error ? <SectionError error={error} fallbackMessage="Não foi possível carregar suas edições" /> : null}
        {isLoading ? <EmptyState message="Carregando solicitações de edição..." /> : null}
        {!isLoading && !error && edits.length === 0 ? (
          <EmptyState message="Você ainda não possui solicitações de edição nesse filtro." />
        ) : null}

        {!isLoading && !error
          ? edits.map((edit) => (
              <div key={edit.id} className="rounded-xl border border-slate-200 p-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{edit.auctionTitle}</h3>
                    <Badge variant={getEditStatusVariant(edit.status)}>{getEditStatusLabel(edit.status)}</Badge>
                    <Badge variant="neutral">{edit.editType}</Badge>
                  </div>

                  <div className="grid gap-1 text-sm text-slate-500 sm:grid-cols-2">
                    <p>Enviada em: {formatDate(edit.createdAt)}</p>
                    <p>Revisada em: {edit.reviewedAt ? formatDate(edit.reviewedAt) : "Ainda não revisada"}</p>
                  </div>

                  {edit.rejectionReason ? (
                    <Alert variant="error">Motivo da rejeição: {edit.rejectionReason}</Alert>
                  ) : null}

                  <Link to={`/auctions/${edit.auctionId}`}>
                    <Button variant="secondary" type="button">
                      Ver leilão
                    </Button>
                  </Link>
                </div>
              </div>
            ))
          : null}
      </div>

      <PaginationControls pagination={pagination} onPrevious={onPreviousPage} onNext={onNextPage} />
    </Card>
  );
}

export function UserDashboardPage() {
  const [auctionPage, setAuctionPage] = useState(1);
  const [winsPage, setWinsPage] = useState(1);
  const [bidsPage, setBidsPage] = useState(1);
  const [editsPage, setEditsPage] = useState(1);
  const [auctionStatus, setAuctionStatus] = useState<AuctionStatus | undefined>(undefined);
  const [bidStatus, setBidStatus] = useState<UserBidActivityStatus | undefined>(undefined);
  const [editStatus, setEditStatus] = useState<UserEditStatus | undefined>(undefined);

  const dashboardQuery = useUserDashboard();
  const auctionsQuery = useUserAuctions({ page: auctionPage, limit: 5, status: auctionStatus });
  const winsQuery = useUserWins({ page: winsPage, limit: 5 });
  const bidsQuery = useUserBids({ page: bidsPage, limit: 5, status: bidStatus });
  const editsQuery = useUserPendingEdits({ page: editsPage, limit: 5, status: editStatus });

  const summary = dashboardQuery.data?.data;

  return (
    <div className="space-y-6">
      {dashboardQuery.error ? (
        <SectionError error={dashboardQuery.error} fallbackMessage="Não foi possível carregar o resumo da sua conta" />
      ) : null}

      {summary ? <AccountOverview summary={summary} /> : null}

      {dashboardQuery.isLoading ? <EmptyState message="Carregando painel do usuário..." /> : null}

      <MyAuctionsSection
        auctions={auctionsQuery.data?.data ?? []}
        isLoading={auctionsQuery.isLoading}
        error={auctionsQuery.error}
        pagination={auctionsQuery.data?.pagination}
        status={auctionStatus}
        onStatusChange={(nextStatus) => {
          setAuctionStatus(nextStatus);
          setAuctionPage(1);
        }}
        onPreviousPage={() => setAuctionPage((currentPage) => Math.max(1, currentPage - 1))}
        onNextPage={() => setAuctionPage((currentPage) => currentPage + 1)}
      />

      <MyWinsSection
        wins={winsQuery.data?.data ?? []}
        isLoading={winsQuery.isLoading}
        error={winsQuery.error}
        pagination={winsQuery.data?.pagination}
        onPreviousPage={() => setWinsPage((currentPage) => Math.max(1, currentPage - 1))}
        onNextPage={() => setWinsPage((currentPage) => currentPage + 1)}
      />

      <MyBidsSection
        bids={bidsQuery.data?.data ?? []}
        isLoading={bidsQuery.isLoading}
        error={bidsQuery.error}
        pagination={bidsQuery.data?.pagination}
        status={bidStatus}
        onStatusChange={(nextStatus) => {
          setBidStatus(nextStatus);
          setBidsPage(1);
        }}
        onPreviousPage={() => setBidsPage((currentPage) => Math.max(1, currentPage - 1))}
        onNextPage={() => setBidsPage((currentPage) => currentPage + 1)}
      />

      <MyEditsSection
        edits={editsQuery.data?.data ?? []}
        isLoading={editsQuery.isLoading}
        error={editsQuery.error}
        pagination={editsQuery.data?.pagination}
        status={editStatus}
        onStatusChange={(nextStatus) => {
          setEditStatus(nextStatus);
          setEditsPage(1);
        }}
        onPreviousPage={() => setEditsPage((currentPage) => Math.max(1, currentPage - 1))}
        onNextPage={() => setEditsPage((currentPage) => currentPage + 1)}
      />
    </div>
  );
}