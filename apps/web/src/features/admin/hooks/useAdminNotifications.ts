import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useAdminNotifications(limit = 10) {
  return useQuery({
    queryKey: ["admin", "notifications", limit],
    queryFn: () => adminService.getNotifications(limit),
  });
}

export function useMarkAdminNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => adminService.markNotificationAsRead(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}

export function useMarkAdminNotificationAsUnread() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => adminService.markNotificationAsUnread(notificationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] });
    },
  });
}