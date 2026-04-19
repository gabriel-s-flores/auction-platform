import { AppError } from "#application/errors/app-error";
import type { ActivityLogRepository } from "#domain/repositories/activity-log-repository";
import type { AdminNotificationReadRepository } from "#domain/repositories/admin-notification-read-repository";

const NOTIFICATION_ACTIONS = new Set([
  "AUCTION_CREATED",
  "AUCTION_APPROVED",
  "AUCTION_REJECTED",
  "EDIT_SUBMITTED",
  "EDIT_APPROVED",
  "EDIT_REJECTED",
  "USER_BANNED",
  "ADMIN_CREATED",
]);

export class MarkAdminNotificationReadUseCase {
  constructor(
    private readonly activityLogRepository: ActivityLogRepository,
    private readonly adminNotificationReadRepository: AdminNotificationReadRepository
  ) {}

  async execute(notificationId: string, adminId: string): Promise<void> {
    const notification = await this.activityLogRepository.findById(notificationId);

    if (!notification || !NOTIFICATION_ACTIONS.has(notification.action)) {
      throw new AppError("Notificação administrativa não encontrada", 404);
    }

    await this.adminNotificationReadRepository.markAsRead(notificationId, adminId);
  }
}