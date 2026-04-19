import type { ListActivityLogsQuery } from "@auction/shared-types";
import { useMutation, useQuery } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useActivityLogs(query: ListActivityLogsQuery) {
  const queryKey = ["admin", "logs", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , currentQuery] }) => adminService.getActivityLogs(currentQuery),
  });
}

export function useExportActivityLogs() {
  return useMutation({
    mutationFn: (query: Omit<ListActivityLogsQuery, "page" | "limit">) =>
      adminService.exportActivityLogs(query),
  });
}