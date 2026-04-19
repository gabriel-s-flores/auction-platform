import type { AdminNotification } from "@auction/shared-types";
import { Alert, Badge, Card } from "@auction/ui";

import { useAdminNotifications } from "@/features/admin/hooks/useAdminNotifications";
import { getErrorMessage } from "@/shared/api/get-error-message";

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(date));
}

function getVariant(type: AdminNotification["type"]): "neutral" | "success" | "danger" {
  if (type === "AUCTION_APPROVED" || type === "EDIT_APPROVED" || type === "NEW_ADMIN_CREATED") {
    return "success";
  }

  if (type === "AUCTION_REJECTED" || type === "EDIT_REJECTED" || type === "USER_BANNED") {
    return "danger";
  }

  return "neutral";
}

export function AdminNotificationsPage() {
  const notificationsQuery = useAdminNotifications(25);
  const notifications = notificationsQuery.data?.data ?? [];
  let content: React.ReactNode;

  if (notificationsQuery.isLoading) {
    content = (
      <Card className="p-6">
        <p className="text-center text-slate-500">Carregando notificações...</p>
      </Card>
    );
  } else if (notifications.length === 0) {
    content = (
      <Card className="p-6">
        <p className="text-center text-slate-500">Nenhuma notificação administrativa recente.</p>
      </Card>
    );
  } else {
    content = (
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card key={notification.id} className="p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant={getVariant(notification.type)}>{notification.type}</Badge>
                  <span className="text-xs uppercase tracking-wide text-slate-500">
                    {notification.entityType}
                  </span>
                </div>
                <p className="font-medium text-slate-900">{notification.message}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {notification.actor ? `Por ${notification.actor.name} · ` : ""}
                  {formatDateTime(notification.timestamp)}
                </p>
              </div>

              <span className="text-xs text-slate-400">{notification.entityId}</span>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Notificações administrativas</h1>
        <p className="text-sm text-slate-500">
          Acompanhe eventos recentes relevantes para a operação administrativa.
        </p>
      </div>

      {notificationsQuery.error ? (
        <Alert variant="error" className="mb-6">
          {getErrorMessage(notificationsQuery.error, "Não foi possível carregar as notificações")}
        </Alert>
      ) : null}

      {content}
    </div>
  );
}