import { Prisma } from "@prisma/client";

import type { ActionType, ActivityLog } from "#domain/entities/activity-log";
import type {
  ActivityLogRepository,
  CreateActivityLogInput,
  ExportActivityLogsInput,
  ListActivityLogsInput,
  ListAdminNotificationsInput,
} from "#domain/repositories/activity-log-repository";
import { prisma } from "#infrastructure/database/prisma-client";

function mapActivityLog(model: {
 id: string;
 action: string;
 entityType: string;
 entityId: string;
 actorId: string | null;
 actor: { name: string; email: string } | null;
 metadata: Prisma.JsonValue | null;
 ipAddress: string | null;
 userAgent: string | null;
 createdAt: Date;
}): ActivityLog {
 return {
 id: model.id,
 action: model.action as ActionType,
 entityType: model.entityType,
 entityId: model.entityId,
 actorId: model.actorId,
 actorName: model.actor?.name ?? null,
 actorEmail: model.actor?.email ?? null,
 metadata: model.metadata as Record<string, unknown> | null,
 ipAddress: model.ipAddress,
 userAgent: model.userAgent,
 createdAt: model.createdAt
 };
}

function buildWhere(input: ExportActivityLogsInput): Prisma.ActivityLogWhereInput {
  const where: Prisma.ActivityLogWhereInput = {};

  if (input.action) {
    where.action = input.action;
  }

  if (input.entityType) {
    where.entityType = input.entityType;
  }

  if (input.actorId) {
    where.actorId = input.actorId;
  }

  if (input.startDate || input.endDate) {
    where.createdAt = {};

    if (input.startDate) {
      where.createdAt.gte = input.startDate;
    }

    if (input.endDate) {
      where.createdAt.lte = input.endDate;
    }
  }

  return where;
}

export class PrismaActivityLogRepository implements ActivityLogRepository {
 async create(input: CreateActivityLogInput): Promise<ActivityLog> {
 const metadata = input.metadata ? (input.metadata as Prisma.InputJsonValue) : Prisma.JsonNull;
 const log = await prisma.activityLog.create({
 data: {
 action: input.action,
 entityType: input.entityType,
 entityId: input.entityId,
 actorId: input.actorId,
 metadata,
 ipAddress: input.ipAddress,
 userAgent: input.userAgent
  },
  include: {
  actor: {
  select: {
  name: true,
  email: true
  }
  }
  }
 });
 return mapActivityLog(log);
 }

 async findById(id: string): Promise<ActivityLog | null> {
 const log = await prisma.activityLog.findUnique({
 where: { id },
 include: {
 actor: {
 select: {
 name: true,
 email: true
 }
 }
 }
 });

 return log ? mapActivityLog(log) : null;
 }

 async list(input: ListActivityLogsInput): Promise<{ data: ActivityLog[]; total: number }> {
 const page = input.page ?? 1;
 const limit = input.limit ?? 20;
 const skip = (page - 1) * limit;

  const where = buildWhere(input);

 const [logs, total] = await Promise.all([
 prisma.activityLog.findMany({
 where,
 skip,
 take: limit,
  orderBy: { createdAt: "desc" },
  include: {
  actor: {
  select: {
  name: true,
  email: true
  }
  }
  }
 }),
 prisma.activityLog.count({ where })
 ]);

 return {
 data: logs.map(mapActivityLog),
 total
 };
 }

  async listAll(input: ExportActivityLogsInput): Promise<ActivityLog[]> {
  const where = buildWhere(input);

  const logs = await prisma.activityLog.findMany({
  where,
  orderBy: { createdAt: "desc" },
  include: {
  actor: {
  select: {
  name: true,
  email: true
  }
  }
  }
  });

  return logs.map(mapActivityLog);
  }

  async listRecentForAdminNotifications(input: ListAdminNotificationsInput): Promise<ActivityLog[]> {
  const limit = input.limit ?? 20;
  const logs = await prisma.activityLog.findMany({
  where: {
  action: {
  in: [
  "AUCTION_CREATED",
  "AUCTION_APPROVED",
  "AUCTION_REJECTED",
  "EDIT_SUBMITTED",
  "EDIT_APPROVED",
  "EDIT_REJECTED",
  "USER_BANNED",
  "ADMIN_CREATED"
  ]
  }
  },
  take: limit,
  orderBy: { createdAt: "desc" },
  include: {
  actor: {
  select: {
  name: true,
  email: true
  }
  }
  }
  });

  return logs.map(mapActivityLog);
  }
}
