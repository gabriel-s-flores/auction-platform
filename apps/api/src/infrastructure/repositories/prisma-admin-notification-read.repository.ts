import type { AdminNotificationRead } from "#domain/entities/admin-notification-read";
import type { AdminNotificationReadRepository, ListAdminNotificationReadsInput } from "#domain/repositories/admin-notification-read-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapAdminNotificationRead(model: {
  id: string;
  activityLogId: string;
  adminId: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): AdminNotificationRead {
  return {
    id: model.id,
    activityLogId: model.activityLogId,
    adminId: model.adminId,
    isRead: model.isRead,
    readAt: model.readAt,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}

export class PrismaAdminNotificationReadRepository implements AdminNotificationReadRepository {
  async listByAdminAndNotificationIds(
    input: ListAdminNotificationReadsInput
  ): Promise<AdminNotificationRead[]> {
    if (input.notificationIds.length === 0) {
      return [];
    }

    const reads = await prisma.adminNotificationRead.findMany({
      where: {
        activityLogId: { in: input.notificationIds },
        adminId: input.adminId,
      },
    });

    return reads.map(mapAdminNotificationRead);
  }

  async markAsRead(activityLogId: string, adminId: string): Promise<void> {
    await prisma.adminNotificationRead.upsert({
      where: {
        activityLogId_adminId: {
          activityLogId,
          adminId,
        },
      },
      update: {
        isRead: true,
        readAt: new Date(),
      },
      create: {
        activityLogId,
        adminId,
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAsUnread(activityLogId: string, adminId: string): Promise<void> {
    await prisma.adminNotificationRead.updateMany({
      where: {
        activityLogId,
        adminId,
      },
      data: {
        isRead: false,
        readAt: null,
      },
    });
  }
}