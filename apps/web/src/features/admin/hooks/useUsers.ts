import type { ListUsersQuery } from "@auction/shared-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useUsers(query: ListUsersQuery) {
  const queryKey = ["admin", "users", "list", query] as const;

  return useQuery({
    queryKey,
    queryFn: ({ queryKey: [, , , currentQuery] }) => adminService.getUsers(currentQuery),
  });
}

export function useUserDetail(userId: string | null) {
  const queryKey = ["admin", "users", "detail", userId] as const;

  return useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: ({ queryKey: [, , , currentUserId] }) => {
      if (!currentUserId) {
        throw new Error("User id is required");
      }

      return adminService.getUserDetail(currentUserId);
    },
  });
}

export function useBanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      adminService.banUser(userId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnbanUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.unbanUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function usePromoteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminService.promoteUser(userId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}