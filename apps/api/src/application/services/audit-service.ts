import type { ActionType } from "#domain/entities/activity-log";
import type { ActivityLogRepository, CreateActivityLogInput } from "#domain/repositories/activity-log-repository";

export interface AuditContext {
 actorId?: string;
 ipAddress?: string;
 userAgent?: string;
}

export class AuditService {
 constructor(private readonly activityLogRepository: ActivityLogRepository) {}

 async log(
 action: ActionType,
 entityType: string,
 entityId: string,
 metadata: Record<string, unknown> | null = null,
 context: AuditContext = {}
 ): Promise<void> {
 const input: CreateActivityLogInput = {
 action,
 entityType,
 entityId,
 metadata: metadata ?? undefined,
 ...context
 };

 await this.activityLogRepository.create(input);
 }
}
