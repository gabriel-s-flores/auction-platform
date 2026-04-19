import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useAdminNotifications(limit = 10) {
  return useQuery({
    queryKey: ["admin", "notifications", limit],
    queryFn: () => adminService.getNotifications(limit),
  });
}