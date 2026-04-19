import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function useAdmins() {
  return useQuery({
    queryKey: ["admin", "admins"],
    queryFn: adminService.getAdmins,
  });
}

export function useCreateAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.createAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}

export function useDemoteAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adminService.demoteAdmin,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "admins"] });
    },
  });
}