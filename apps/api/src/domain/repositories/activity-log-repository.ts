import type { ActionType, ActivityLog } from "#domain/entities/activity-log";

export interface CreateActivityLogInput {
  action: ActionType;
  entityType: string;
  entityId: string;
  actorId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export interface ListActivityLogsInput {
  page?: number;
  limit?: number;
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ExportActivityLogsInput {
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ListAdminNotificationsInput {
  limit?: number;
}

export interface ActivityLogRepository {
  create(input: CreateActivityLogInput): Promise<ActivityLog>;
  findById(id: string): Promise<ActivityLog | null>;
  list(input: ListActivityLogsInput): Promise<{ data: ActivityLog[]; total: number }>;
  listAll(input: ExportActivityLogsInput): Promise<ActivityLog[]>;
  listRecentForAdminNotifications(input: ListAdminNotificationsInput): Promise<ActivityLog[]>;
}