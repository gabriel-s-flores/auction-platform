import { useQuery } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useAdminDashboardStats() {
  return useQuery({
    queryKey: ["admin", "dashboard", "stats"],
    queryFn: adminService.getDashboardStats,
  });
}

export function useAdminRecentAuctions() {
  return useQuery({
    queryKey: ["admin", "dashboard", "recentAuctions"],
    queryFn: adminService.getRecentAuctions,
  });
}