import type { ActionType } from "#domain/entities/activity-log";
import type { ActivityLogRepository } from "#domain/repositories/activity-log-repository";

export interface ListActivityLogsInput {
  page?: number;
  limit?: number;
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ActivityLogOutput {
  id: string;
  action: ActionType;
  entityType: string;
  entityId: string;
  actorId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ListActivityLogsOutput {
  data: ActivityLogOutput[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function parseStartDate(date?: string) {
  if (!date) {
    return undefined;
  }

  return date.length === 10 ? new Date(`${date}T00:00:00`) : new Date(date);
}

function parseEndDate(date?: string) {
  if (!date) {
    return undefined;
  }

  return date.length === 10 ? new Date(`${date}T23:59:59.999`) : new Date(date);
}

export class ListActivityLogsUseCase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async execute(input: ListActivityLogsInput): Promise<ListActivityLogsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const result = await this.activityLogRepository.list({
      page,
      limit,
      action: input.action,
      entityType: input.entityType,
      actorId: input.actorId,
      startDate: parseStartDate(input.startDate),
      endDate: parseEndDate(input.endDate),
    });

    return {
      data: result.data.map((log) => ({
        id: log.id,
        action: log.action,
        entityType: log.entityType,
        entityId: log.entityId,
        actorId: log.actorId,
        actorName: log.actorName,
        actorEmail: log.actorEmail,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
  }
}