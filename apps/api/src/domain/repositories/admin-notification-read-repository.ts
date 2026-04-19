import type { AdminNotificationRead } from "#domain/entities/admin-notification-read";

export interface ListAdminNotificationReadsInput {
  adminId: string;
  notificationIds: string[];
}

export interface AdminNotificationReadRepository {
  listByAdminAndNotificationIds(
    input: ListAdminNotificationReadsInput
  ): Promise<AdminNotificationRead[]>;
  markAsRead(activityLogId: string, adminId: string): Promise<void>;
  markAsUnread(activityLogId: string, adminId: string): Promise<void>;
}