import type { AdminDto, CreateAdminRequest } from "@auction/shared-types";
import {
  Alert,
  Badge,
  Button,
  Card,
  FormField,
  Input,
  staggerContainerCards,
  StateMessage,
} from "@auction/ui";
import { motion } from "framer-motion";
import type { SyntheticEvent } from "react";
import { useState } from "react";

import { useAdmins, useCreateAdmin, useDemoteAdmin } from "@/features/admin/hooks/useAdmins";
import { getErrorMessage } from "@/shared/api/get-error-message";
import { useAuth } from "@/shared/auth/auth-context";
import { confirm } from "@/shared/modal";

function formatDateTime(date: string | null) {
  if (!date) {
    return "Nunca";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getRoleVariant(role: AdminDto["role"]): "neutral" | "success" | "danger" {
  if (role === "SUPER_ADMIN") {
    return "danger";
  }

  if (role === "ADMIN") {
    return "success";
  }

  return "neutral";
}

export function AdminAdminsPage() {
  const { user } = useAuth();
  const adminsQuery = useAdmins();
  const createAdminMutation = useCreateAdmin();
  const demoteAdminMutation = useDemoteAdmin();

  const [form, setForm] = useState<CreateAdminRequest>({
    email: "",
    name: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CreateAdminRequest, string>>>({});

  const admins = adminsQuery.data?.data ?? [];
  const superAdminCount = admins.filter((admin) => admin.role === "SUPER_ADMIN").length;

  const handleCreateAdmin = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = {
      name: form.name.trim().length >= 2 ? undefined : "Informe um nome com pelo menos 2 caracteres.",
      email: form.email.trim() ? undefined : "Informe o e-mail do admin.",
      password: form.password.length >= 8 ? undefined : "A senha deve ter pelo menos 8 caracteres.",
    };

    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      setFormErrors(nextErrors);
      return;
    }

    await createAdminMutation.mutateAsync(form);
    setForm({ email: "", name: "", password: "" });
    setFormErrors({});
  };

  const handleDemote = async (admin: AdminDto) => {
    const userConfirmed = await confirm(`Deseja rebaixar ${admin.name} para USER?`, {
      variant: "destructive",
      title: "Rebaixar admin",
    });

    if (!userConfirmed) {
      return;
    }

    await demoteAdminMutation.mutateAsync(admin.id);
  };

  let actionErrorMessage: string | null = null;

  if (createAdminMutation.isError) {
    actionErrorMessage = getErrorMessage(
      createAdminMutation.error,
      "Não foi possível executar a ação administrativa"
    );
  } else if (demoteAdminMutation.isError) {
    actionErrorMessage = getErrorMessage(
      demoteAdminMutation.error,
      "Não foi possível executar a ação administrativa"
    );
  }

  let adminsContent: React.ReactNode;

  if (adminsQuery.isLoading) {
    adminsContent = <StateMessage>Carregando admins...</StateMessage>;
  } else if (admins.length === 0) {
    adminsContent = <StateMessage>Nenhum admin encontrado.</StateMessage>;
  } else {
    adminsContent = (
      <div className="space-y-4">
        {admins.map((admin) => {
          const isCurrentUser = admin.id === user?.id;
          const isProtectedSuperAdmin = admin.role === "SUPER_ADMIN" && superAdminCount <= 1;
          const canDemote = !isCurrentUser && !isProtectedSuperAdmin;

          return (
            <div key={admin.id} className="rounded-lg border border-slate-200 px-4 py-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{admin.name}</h3>
                    <Badge variant={getRoleVariant(admin.role)}>{admin.role}</Badge>
                    {isCurrentUser ? <Badge variant="neutral">Você</Badge> : null}
                  </div>

                  <p className="mt-1 text-sm text-slate-600">{admin.email}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Criado em {formatDateTime(admin.createdAt)} · Último login: {formatDateTime(admin.lastLoginAt)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  disabled={!canDemote || demoteAdminMutation.isPending}
                  onClick={() => {
                    void handleDemote(admin);
                  }}
                >
                  {demoteAdminMutation.isPending ? "Processando..." : "Rebaixar"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Gestão de admins</h1>
        <p className="text-sm text-slate-500">
          Área exclusiva de SUPER_ADMIN para criação e rebaixamento de contas administrativas.
        </p>
      </div>

      {adminsQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(adminsQuery.error, "Não foi possível carregar os admins")}
        </Alert>
      ) : null}

      {actionErrorMessage ? (
        <Alert variant="error">
          {actionErrorMessage}
        </Alert>
      ) : null}

      <motion.div
        className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_1.2fr]"
        variants={staggerContainerCards}
        initial="hidden"
        animate="visible"
      >
        <Card className="p-6">
          <h2 className="mb-4 text-lg font-semibold">Criar novo admin</h2>

          <form
            className="space-y-4"
            noValidate
            onSubmit={(event) => void handleCreateAdmin(event)}
          >
            <FormField
              id="admin-name"
              label="Nome"
              error={formErrors.name}
              errorId="admin-name-error"
            >
              <Input
                aria-describedby={formErrors.name ? "admin-name-error" : undefined}
                aria-invalid={Boolean(formErrors.name)}
                id="admin-name"
                value={form.name}
                onChange={(event) => {
                  setForm((current) => ({ ...current, name: event.target.value }));
                  setFormErrors((current) => ({ ...current, name: undefined }));
                }}
              />
            </FormField>

            <FormField
              id="admin-email"
              label="E-mail"
              error={formErrors.email}
              errorId="admin-email-error"
            >
              <Input
                aria-describedby={formErrors.email ? "admin-email-error" : undefined}
                aria-invalid={Boolean(formErrors.email)}
                id="admin-email"
                type="text"
                value={form.email}
                onChange={(event) => {
                  setForm((current) => ({ ...current, email: event.target.value }));
                  setFormErrors((current) => ({ ...current, email: undefined }));
                }}
              />
            </FormField>

            <FormField
              id="admin-password"
              label="Senha"
              error={formErrors.password}
              errorId="admin-password-error"
            >
              <Input
                aria-describedby={formErrors.password ? "admin-password-error" : undefined}
                aria-invalid={Boolean(formErrors.password)}
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(event) => {
                  setForm((current) => ({ ...current, password: event.target.value }));
                  setFormErrors((current) => ({ ...current, password: undefined }));
                }}
              />
            </FormField>

            <Button className="w-full" disabled={createAdminMutation.isPending} type="submit">
              {createAdminMutation.isPending ? "Criando..." : "Criar admin"}
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Admins cadastrados</h2>
            <p className="text-sm text-slate-500">
              {admins.length} conta(s) com privilégios administrativos encontradas.
            </p>
          </div>

          {adminsContent}
        </Card>
      </motion.div>
    </div>
  );
}
