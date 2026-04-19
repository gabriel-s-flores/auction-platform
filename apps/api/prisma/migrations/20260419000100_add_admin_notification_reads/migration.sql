-- CreateTable
CREATE TABLE "admin_notification_reads" (
    "id" UUID NOT NULL,
    "activityLogId" UUID NOT NULL,
    "adminId" UUID NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT true,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "admin_notification_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_notification_reads_activityLogId_adminId_key" ON "admin_notification_reads"("activityLogId", "adminId");

-- CreateIndex
CREATE INDEX "admin_notification_reads_adminId_isRead_idx" ON "admin_notification_reads"("adminId", "isRead");

-- CreateIndex
CREATE INDEX "admin_notification_reads_activityLogId_idx" ON "admin_notification_reads"("activityLogId");

-- AddForeignKey
ALTER TABLE "admin_notification_reads" ADD CONSTRAINT "admin_notification_reads_activityLogId_fkey" FOREIGN KEY ("activityLogId") REFERENCES "activity_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_notification_reads" ADD CONSTRAINT "admin_notification_reads_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;