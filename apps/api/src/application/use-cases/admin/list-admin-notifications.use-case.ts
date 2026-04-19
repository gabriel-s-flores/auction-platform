import type { ActivityLogRepository } from "#domain/repositories/activity-log-repository";
import type { AdminNotificationReadRepository } from "#domain/repositories/admin-notification-read-repository";

interface ActorSummary {
  id: string;
  name: string;
}

export interface AdminNotificationOutput {
  id: string;
  type:
    | "AUCTION_PENDING_REVIEW"
    | "AUCTION_APPROVED"
    | "AUCTION_REJECTED"
    | "EDIT_PENDING_REVIEW"
    | "EDIT_APPROVED"
    | "EDIT_REJECTED"
    | "USER_BANNED"
    | "NEW_ADMIN_CREATED";
  entityType: "auction" | "edit" | "user";
  entityId: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  readAt: string | null;
  actor?: ActorSummary;
}

function buildNotificationMessage(log: {
  action: string;
  actorName: string | null;
  metadata: Record<string, unknown> | null;
}) {
  const actorName = log.actorName ?? "Sistema";
  const metadata = log.metadata ?? {};

  switch (log.action) {
    case "AUCTION_CREATED":
      return `${actorName} enviou um leilão para aprovação`;
    case "AUCTION_APPROVED":
      return `${actorName} aprovou um leilão`;
    case "AUCTION_REJECTED":
      return `${actorName} rejeitou um leilão`;
    case "EDIT_SUBMITTED":
      return `${actorName} enviou uma edição para revisão`;
    case "EDIT_APPROVED":
      return `${actorName} aprovou uma edição pendente`;
    case "EDIT_REJECTED":
      return `${actorName} rejeitou uma edição pendente`;
    case "USER_BANNED":
      return `${actorName} baniu um usuário`;
    case "ADMIN_CREATED":
      return `${actorName} criou um novo admin`;
    default:
      return String(metadata.title ?? metadata.name ?? "Nova notificação administrativa");
  }
}

function mapActionToNotificationType(action: string): AdminNotificationOutput["type"] | null {
  switch (action) {
    case "AUCTION_CREATED":
      return "AUCTION_PENDING_REVIEW";
    case "AUCTION_APPROVED":
      return "AUCTION_APPROVED";
    case "AUCTION_REJECTED":
      return "AUCTION_REJECTED";
    case "EDIT_SUBMITTED":
      return "EDIT_PENDING_REVIEW";
    case "EDIT_APPROVED":
      return "EDIT_APPROVED";
    case "EDIT_REJECTED":
      return "EDIT_REJECTED";
    case "USER_BANNED":
      return "USER_BANNED";
    case "ADMIN_CREATED":
      return "NEW_ADMIN_CREATED";
    default:
      return null;
  }
}

function mapEntityType(entityType: string): AdminNotificationOutput["entityType"] {
  if (entityType === "pending_edit") {
    return "edit";
  }

  if (entityType === "user") {
    return "user";
  }

  return "auction";
}

export class ListAdminNotificationsUseCase {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly adminNotificationReadRepository: AdminNotificationReadRepository
  ) {}

  async execute(adminId: string, limit = 20): Promise<AdminNotificationOutput[]> {
    const logs = await this.activityLogRepository.listRecentForAdminNotifications({ limit });
    const reads = await this.adminNotificationReadRepository.listByAdminAndNotificationIds({
      adminId,
      notificationIds: logs.map((log) => log.id),
    });
    const readByNotificationId = new Map(reads.map((read) => [read.activityLogId, read]));
    const notifications: AdminNotificationOutput[] = [];

    for (const log of logs) {
      const type = mapActionToNotificationType(log.action);

      if (!type) {
        continue;
      }

      const actor = log.actorId && log.actorName
        ? {
            id: log.actorId,
            name: log.actorName,
          }
        : undefined;
      const readState = readByNotificationId.get(log.id);

      notifications.push({
        id: log.id,
        type,
        entityType: mapEntityType(log.entityType),
        entityId: log.entityId,
        message: buildNotificationMessage(log),
        timestamp: log.createdAt.toISOString(),
        isRead: readState?.isRead ?? false,
        readAt: readState?.readAt?.toISOString() ?? null,
        actor,
      });
    }

    return notifications;
  }
}