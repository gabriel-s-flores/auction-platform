import type { ListUsersQuery, UserDetailDto, UserDto, UserRole } from "@auction/shared-types";
import { Alert, Badge, Button, Card, Input } from "@auction/ui";
import { useEffect, useMemo, useState } from "react";

import {
  useBanUser,
  usePromoteUser,
  useUnbanUser,
  useUserDetail,
  useUsers,
} from "@/features/admin/hooks/useUsers";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { alert, confirm } from "@/shared/modal";
import { useAuth } from "@/shared/auth/auth-context";

type UserFiltersForm = {
  search: string;
  role: "" | UserRole;
  isBanned: "" | "true" | "false";
};

const INITIAL_FILTERS: UserFiltersForm = {
  search: "",
  role: "",
  isBanned: "",
};

function buildQueryFromFilters(
  filters: UserFiltersForm,
  page: number,
  limit = 20
): ListUsersQuery {
  return {
    page,
    limit,
    search: filters.search.trim() || undefined,
    role: filters.role || undefined,
    isBanned:
      filters.isBanned === "" ? undefined : filters.isBanned === "true",
  };
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getRoleVariant(role: UserRole): "neutral" | "success" | "danger" {
  switch (role) {
    case "SUPER_ADMIN":
      return "danger";
    case "ADMIN":
      return "success";
    default:
      return "neutral";
  }
}

function getStatusVariant(isBanned: boolean): "neutral" | "success" | "danger" {
  return isBanned ? "danger" : "success";
}

function getActionErrorMessage(args: {
  banUserError: unknown;
  isBanUserError: boolean;
  promoteUserError: unknown;
  isPromoteUserError: boolean;
  unbanUserError: unknown;
  isUnbanUserError: boolean;
}) {
  if (args.isBanUserError) {
    return getErrorMessage(args.banUserError, "Não foi possível executar a ação no usuário");
  }

  if (args.isUnbanUserError) {
    return getErrorMessage(args.unbanUserError, "Não foi possível executar a ação no usuário");
  }

  if (args.isPromoteUserError) {
    return getErrorMessage(args.promoteUserError, "Não foi possível executar a ação no usuário");
  }

  return null;
}

function UserDetailCard({
  currentUserId,
  currentUserRole,
  user,
  banReason,
  onBanReasonChange,
  onBan,
  onUnban,
  onPromote,
  isBanning,
  isUnbanning,
  isPromoting,
}: {
  currentUserId: string | undefined;
  currentUserRole: UserRole | undefined;
  user: UserDetailDto;
  banReason: string;
  onBanReasonChange: (value: string) => void;
  onBan: () => void;
  onUnban: () => void;
  onPromote: () => void;
  isBanning: boolean;
  isUnbanning: boolean;
  isPromoting: boolean;
}) {
  const canPromote = currentUserRole === "SUPER_ADMIN" && user.role === "USER" && !user.isBanned;
  const canBan = currentUserId !== user.id && user.role !== "SUPER_ADMIN";
  const canUnban = canBan && user.isBanned;

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Detalhes do usuário</h2>
          <p className="text-sm text-slate-500">Dados cadastrais, atividade e ações administrativas.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
          <Badge variant={getStatusVariant(user.isBanned)}>
            {user.isBanned ? "Banido" : "Ativo"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm text-slate-700 md:grid-cols-2">
        <div>
          <p className="font-medium text-slate-900">Nome</p>
          <p>{user.name}</p>
        </div>

        <div>
          <p className="font-medium text-slate-900">E-mail</p>
          <p>{user.email}</p>
        </div>

        <div>
          <p className="font-medium text-slate-900">Criado em</p>
          <p>{formatDateTime(user.createdAt)}</p>
        </div>

        <div>
          <p className="font-medium text-slate-900">Atualizado em</p>
          <p>{formatDateTime(user.updatedAt)}</p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">Leilões criados</p>
          <p className="text-2xl font-semibold text-slate-800">{user.auctionsCount}</p>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">Lances realizados</p>
          <p className="text-2xl font-semibold text-slate-800">{user.bidsCount}</p>
        </div>

        <div className="rounded-lg bg-slate-50 px-4 py-3">
          <p className="text-sm font-medium text-slate-900">Leilões vencidos</p>
          <p className="text-2xl font-semibold text-slate-800">{user.wonAuctionsCount}</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {canBan && !user.isBanned ? (
          <div className="space-y-3 rounded-lg border border-rose-200 bg-rose-50 px-4 py-4">
            <div>
              <p className="font-medium text-rose-900">Banir usuário</p>
              <p className="text-sm text-rose-700">
                Informe um motivo para bloquear o acesso do usuário à plataforma.
              </p>
            </div>

            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                id="ban-user-reason"
                placeholder="Motivo do banimento"
                value={banReason}
                onChange={(event) => onBanReasonChange(event.target.value)}
              />

              <Button
                type="button"
                className="bg-rose-600 hover:bg-rose-700"
                onClick={onBan}
                disabled={isBanning}
              >
                {isBanning ? "Banindo..." : "Banir"}
              </Button>
            </div>
          </div>
        ) : null}

        {canUnban ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-emerald-900">Desbanir usuário</p>
                <p className="text-sm text-emerald-700">
                  Reative o acesso do usuário à plataforma.
                </p>
              </div>

              <Button type="button" onClick={onUnban} disabled={isUnbanning}>
                {isUnbanning ? "Desbanindo..." : "Desbanir"}
              </Button>
            </div>
          </div>
        ) : null}

        {canPromote ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-amber-900">Promover para admin</p>
                <p className="text-sm text-amber-700">
                  Esta ação concede acesso administrativo ao usuário selecionado.
                </p>
              </div>

              <Button type="button" variant="secondary" onClick={onPromote} disabled={isPromoting}>
                {isPromoting ? "Promovendo..." : "Promover"}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}

function UsersListSection({
  isLoading,
  page,
  pagination,
  selectedUserId,
  users,
  onPageChange,
  onSelectUser,
}: {
  isLoading: boolean;
  page: number;
  pagination:
    | {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      }
    | undefined;
  selectedUserId: string | null;
  users: UserDto[];
  onPageChange: (page: number) => void;
  onSelectUser: (userId: string) => void;
}) {
  let content: React.ReactNode;

  if (isLoading) {
    content = <p className="py-6 text-center text-slate-500">Carregando usuários...</p>;
  } else if (users.length === 0) {
    content = <p className="py-6 text-center text-slate-500">Nenhum usuário encontrado.</p>;
  } else {
    content = (
      <div className="space-y-3">
        {users.map((user: UserDto) => {
          const isSelected = user.id === selectedUserId;

          return (
            <div
              key={user.id}
              className={`rounded-lg border px-4 py-4 ${
                isSelected ? "border-amber-300 bg-amber-50" : "border-slate-200"
              }`}
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{user.name}</h3>
                    <Badge variant={getRoleVariant(user.role)}>{user.role}</Badge>
                    <Badge variant={getStatusVariant(user.isBanned)}>
                      {user.isBanned ? "Banido" : "Ativo"}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{user.email}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Criado em {formatDateTime(user.createdAt)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant={isSelected ? "primary" : "secondary"}
                  onClick={() => onSelectUser(user.id)}
                >
                  {isSelected ? "Selecionado" : "Ver detalhes"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Usuários</h2>
          <p className="text-sm text-slate-500">
            {pagination ? `${pagination.total} usuário(s) encontrado(s)` : "Carregando usuários..."}
          </p>
        </div>
      </div>

      {content}

      {pagination && pagination.totalPages > 1 ? (
        <div className="mt-6 flex justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            Anterior
          </Button>

          <span className="px-4 py-2 text-sm text-slate-600">
            Página {pagination.page} de {pagination.totalPages}
          </span>

          <Button
            variant="secondary"
            onClick={() => onPageChange(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
          >
            Próxima
          </Button>
        </div>
      ) : null}
    </Card>
  );
}

function UserDetailsSection({
  currentUserId,
  currentUserRole,
  isLoading,
  errorMessage,
  selectedUser,
  selectedUserId,
  banReason,
  onBanReasonChange,
  onBan,
  onUnban,
  onPromote,
  isBanning,
  isUnbanning,
  isPromoting,
}: {
  currentUserId: string | undefined;
  currentUserRole: UserRole | undefined;
  isLoading: boolean;
  errorMessage: string | null;
  selectedUser: UserDetailDto | undefined;
  selectedUserId: string | null;
  banReason: string;
  onBanReasonChange: (value: string) => void;
  onBan: () => void;
  onUnban: () => void;
  onPromote: () => void;
  isBanning: boolean;
  isUnbanning: boolean;
  isPromoting: boolean;
}) {
  if (!selectedUserId) {
    return (
      <Card className="p-6">
        <p className="py-6 text-center text-slate-500">
          Selecione um usuário para visualizar detalhes e ações disponíveis.
        </p>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="py-6 text-center text-slate-500">Carregando detalhes do usuário...</p>
      </Card>
    );
  }

  if (errorMessage) {
    return (
      <Card className="p-6">
        <Alert variant="error">{errorMessage}</Alert>
      </Card>
    );
  }

  if (!selectedUser) {
    return null;
  }

  return (
    <UserDetailCard
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      user={selectedUser}
      banReason={banReason}
      onBanReasonChange={onBanReasonChange}
      onBan={onBan}
      onUnban={onUnban}
      onPromote={onPromote}
      isBanning={isBanning}
      isUnbanning={isUnbanning}
      isPromoting={isPromoting}
    />
  );
}

export function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<UserFiltersForm>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<UserFiltersForm>(INITIAL_FILTERS);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [banReason, setBanReason] = useState("");

  const usersQuery = useUsers(buildQueryFromFilters(appliedFilters, page));
  const selectedUserQuery = useUserDetail(selectedUserId);
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const promoteUserMutation = usePromoteUser();

  const users = useMemo<UserDto[]>(() => usersQuery.data?.data ?? [], [usersQuery.data?.data]);
  const pagination = usersQuery.data?.pagination;
  const selectedUser = selectedUserQuery.data?.data;

  useEffect(() => {
    if (users.length === 0) {
      setSelectedUserId(null);
      return;
    }

    if (!selectedUserId || !users.some((user) => user.id === selectedUserId)) {
      setSelectedUserId(users[0]?.id ?? null);
    }
  }, [selectedUserId, users]);

  const applyFilters = () => {
    setPage(1);
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    setFilters(INITIAL_FILTERS);
    setAppliedFilters(INITIAL_FILTERS);
    setPage(1);
  };

  const handleBan = async () => {
    if (!selectedUser) {
      return;
    }

    if (banReason.trim().length < 5) {
      await alert("Informe um motivo com pelo menos 5 caracteres para o banimento.");
      return;
    }

    await banUserMutation.mutateAsync({ userId: selectedUser.id, reason: banReason });
    setBanReason("");
  };

  const handleUnban = async () => {
    if (!selectedUser) {
      return;
    }

    const userConfirmed = await confirm("Deseja realmente desbanir este usuário?", {
      variant: "destructive",
      title: "Desbanir usuário",
    });

    if (!userConfirmed) {
      return;
    }

    await unbanUserMutation.mutateAsync(selectedUser.id);
  };

  const handlePromote = async () => {
    if (!selectedUser) {
      return;
    }

    const userConfirmed = await confirm("Deseja promover este usuário para ADMIN?", {
      title: "Promover usuário",
    });

    if (!userConfirmed) {
      return;
    }

    await promoteUserMutation.mutateAsync(selectedUser.id);
  };

  const actionErrorMessage = getActionErrorMessage({
    banUserError: banUserMutation.error,
    isBanUserError: banUserMutation.isError,
    promoteUserError: promoteUserMutation.error,
    isPromoteUserError: promoteUserMutation.isError,
    unbanUserError: unbanUserMutation.error,
    isUnbanUserError: unbanUserMutation.isError,
  });

  const userDetailErrorMessage = selectedUserQuery.isError
    ? getErrorMessage(selectedUserQuery.error, "Não foi possível carregar os detalhes do usuário")
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de usuários</h1>
        <p className="text-sm text-slate-500">
          Consulte usuários cadastrados, revise seus indicadores e aplique ações administrativas.
        </p>
      </div>

      <Card className="p-6">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            applyFilters();
          }}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <label htmlFor="users-search">Busca</label>
              <Input
                id="users-search"
                placeholder="Nome ou e-mail"
                value={filters.search}
                onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              />
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <label htmlFor="users-role">Papel</label>
              <select
                id="users-role"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-hidden transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                value={filters.role}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    role: event.target.value as UserFiltersForm["role"],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="SUPER_ADMIN">SUPER_ADMIN</option>
              </select>
            </div>

            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <label htmlFor="users-status">Status</label>
              <select
                id="users-status"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-hidden transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                value={filters.isBanned}
                onChange={(event) =>
                  setFilters((current) => ({
                    ...current,
                    isBanned: event.target.value as UserFiltersForm["isBanned"],
                  }))
                }
              >
                <option value="">Todos</option>
                <option value="false">Ativos</option>
                <option value="true">Banidos</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit">Aplicar filtros</Button>
            <Button type="button" variant="secondary" onClick={clearFilters}>
              Limpar
            </Button>
          </div>
        </form>
      </Card>

      {usersQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(usersQuery.error, "Não foi possível carregar os usuários")}
        </Alert>
      ) : null}

      {actionErrorMessage ? (
        <Alert variant="error">
          {actionErrorMessage}
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
        <UsersListSection
          isLoading={usersQuery.isLoading}
          page={page}
          pagination={pagination}
          selectedUserId={selectedUserId}
          users={users}
          onPageChange={setPage}
          onSelectUser={(userId) => {
            setSelectedUserId(userId);
            setBanReason("");
          }}
        />

        <UserDetailsSection
          currentUserId={currentUser?.id}
          currentUserRole={currentUser?.role}
          isLoading={selectedUserQuery.isLoading}
          errorMessage={userDetailErrorMessage}
          selectedUser={selectedUser}
          selectedUserId={selectedUserId}
          banReason={banReason}
          onBanReasonChange={setBanReason}
          onBan={() => {
            void handleBan();
          }}
          onUnban={() => {
            void handleUnban();
          }}
          onPromote={() => {
            void handlePromote();
          }}
          isBanning={banUserMutation.isPending}
          isUnbanning={unbanUserMutation.isPending}
          isPromoting={promoteUserMutation.isPending}
        />
      </div>
    </div>
  );
}