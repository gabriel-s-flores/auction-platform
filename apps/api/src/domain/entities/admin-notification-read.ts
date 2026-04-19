export interface AdminNotificationRead {
  id: string;
  activityLogId: string;
  adminId: string;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}