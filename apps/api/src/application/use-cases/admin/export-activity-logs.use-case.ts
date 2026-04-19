import type { ActionType } from "#domain/entities/activity-log";
import type { ActivityLogRepository } from "#domain/repositories/activity-log-repository";

interface ExportActivityLogsInput {
  action?: ActionType;
  entityType?: string;
  actorId?: string;
  startDate?: string;
  endDate?: string;
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

export class ExportActivityLogsUseCase {
  constructor(private readonly activityLogRepository: ActivityLogRepository) {}

  async execute(input: ExportActivityLogsInput) {
    const logs = await this.activityLogRepository.listAll({
      action: input.action,
      entityType: input.entityType,
      actorId: input.actorId,
      startDate: parseStartDate(input.startDate),
      endDate: parseEndDate(input.endDate),
    });

    return {
      data: logs.map((log) => ({
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
      exportedAt: new Date().toISOString(),
    };
  }
}