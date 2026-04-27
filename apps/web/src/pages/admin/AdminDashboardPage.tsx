import type { DashboardStats, RecentAuctionSummary } from "@auction/shared-types";
import { Alert, Badge, Button, Card } from "@auction/ui";
import { Link } from "react-router-dom";

import { useAdminDashboardStats, useAdminRecentAuctions } from "@/features/admin/hooks/useAdminDashboard";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useAuth } from "@/shared/auth/auth-context";

function formatCurrencyInCents(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value / 100);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getStatusLabel(status: string) {
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

function getStatusVariant(status: string): "neutral" | "success" | "danger" {
  switch (status) {
    case "OPEN":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "neutral";
  }
}

function StatCard({
  title,
  value,
  helperText,
  valueClassName,
}: {
  title: string;
  value: number | string;
  helperText: string;
  valueClassName: string;
}) {
  return (
    <Card className="p-6">
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className={`text-3xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-sm text-gray-500">{helperText}</p>
    </Card>
  );
}

function ActivitySummary({ stats }: { stats: DashboardStats | undefined }) {
  return (
    <Card className="p-6">
      <h2 className="mb-4 text-lg font-semibold">Indicadores do dia</h2>

      <div className="space-y-4 text-sm text-slate-700">
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span>Lances registrados hoje</span>
          <strong>{stats?.totalBidsToday ?? 0}</strong>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
          <span>Novos usuários hoje</span>
          <strong>{stats?.newUsersToday ?? 0}</strong>
        </div>

        <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-slate-500">
          Notificações administrativas já estão disponíveis no painel.
        </div>
      </div>
    </Card>
  );
}

function RecentAuctionList({ auctions }: { auctions: RecentAuctionSummary[] }) {
  if (auctions.length === 0) {
    return (
      <p className="py-4 text-center text-gray-500">
        Nenhum leilão recente encontrado.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {auctions.map((auction) => (
        <div
          key={auction.id}
          className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900">{auction.title}</h3>
              <Badge variant={getStatusVariant(auction.status)}>
                {getStatusLabel(auction.status)}
              </Badge>
            </div>

            <div className="mt-2 space-y-1 text-sm text-slate-500">
              <p>
                <strong>Vendedor:</strong> {auction.sellerName}
              </p>
              <p>
                <strong>Melhor lance:</strong> {formatCurrencyInCents(auction.highestBid)}
              </p>
              <p>
                <strong>Data de encerramento:</strong> {formatDate(auction.endsAt)}
              </p>
              <p>
                <strong>Vencedor:</strong> {auction.winnerName ?? "Ainda não definido"}
              </p>
            </div>
          </div>

          <Link to={`/auctions/${auction.id}`} className="md:self-start">
            <Button variant="secondary">Ver detalhes</Button>
          </Link>
        </div>
      ))}
    </div>
  );
}

export function AdminDashboardPage() {
  const { user } = useAuth();
  const statsQuery = useAdminDashboardStats();
  const recentAuctionsQuery = useAdminRecentAuctions();

  const stats = statsQuery.data?.data;
  const recentAuctions = recentAuctionsQuery.data?.data ?? [];
  let recentAuctionsContent: React.ReactNode;

  if (recentAuctionsQuery.error) {
    recentAuctionsContent = (
      <Alert variant="error">
        {getErrorMessage(
          recentAuctionsQuery.error,
          "Não foi possível carregar os leilões recentes"
        )}
      </Alert>
    );
  } else if (recentAuctionsQuery.isLoading) {
    recentAuctionsContent = (
      <p className="py-4 text-center text-gray-500">Carregando leilões recentes...</p>
    );
  } else {
    recentAuctionsContent = <RecentAuctionList auctions={recentAuctions} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Painel de Administrador</h1>
        <p className="text-sm text-slate-500">
          Acompanhe métricas gerais da plataforma e os leilões mais recentes.
        </p>
      </div>

      {statsQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(statsQuery.error, "Não foi possível carregar as métricas do painel")}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          title="Leilões Pendentes"
          value={statsQuery.isLoading ? "..." : stats?.pendingAuctions ?? 0}
          helperText="Aguardando aprovação"
          valueClassName="text-yellow-600"
        />

        <StatCard
          title="Leilões Ativos"
          value={statsQuery.isLoading ? "..." : stats?.activeAuctions ?? 0}
          helperText="Em andamento"
          valueClassName="text-green-600"
        />

        <StatCard
          title="Usuários Registrados"
          value={statsQuery.isLoading ? "..." : stats?.totalUsers ?? 0}
          helperText="Base total da plataforma"
          valueClassName="text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Ações Rápidas</h2>

          <div className="space-y-3">
            <Link to="/admin/auctions/pending">
              <Button variant="primary" className="w-full">
                Revisar Leilões Pendentes
              </Button>
            </Link>

            <Link to="/admin/logs">
              <Button variant="secondary" className="w-full">
                Ver Logs de Atividade
              </Button>
            </Link>

            <Link to="/admin/users">
              <Button variant="secondary" className="w-full">
                Gerenciar Usuários
              </Button>
            </Link>

            {user?.role === "SUPER_ADMIN" ? (
              <Link to="/admin/admins">
                <Button variant="secondary" className="w-full">
                  Gerenciar Admins
                </Button>
              </Link>
            ) : null}

            <Link to="/admin/edits/pending">
              <Button variant="secondary" className="w-full">
                Revisar Edições Pendentes
              </Button>
            </Link>

            <Link to="/admin/notifications">
              <Button variant="secondary" className="w-full">
                Ver Notificações
              </Button>
            </Link>

            <div className="rounded-lg border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              Painel admin com funcionalidades principais concluído.
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Total de leilões</p>
                <p>{statsQuery.isLoading ? "..." : stats?.totalAuctions ?? 0}</p>
              </div>

              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <p className="font-medium text-slate-900">Novos usuários hoje</p>
                <p>{statsQuery.isLoading ? "..." : stats?.newUsersToday ?? 0}</p>
              </div>
            </div>
          </div>
        </Card>

        <ActivitySummary stats={stats} />
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Leilões Recentes</h2>
            <p className="text-sm text-slate-500">
              Últimos cadastros e alterações de status disponíveis no painel.
            </p>
          </div>

          <Link to="/admin/auctions/pending">
            <Button variant="secondary">Ver pendentes</Button>
          </Link>
        </div>

        {recentAuctionsContent}
      </Card>
    </div>
  );
}
