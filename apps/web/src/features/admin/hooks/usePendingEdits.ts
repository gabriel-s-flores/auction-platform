import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { adminService } from "@/features/admin/services/admin.service";

export function usePendingEdits(page = 1, limit = 20) {
  return useQuery({
    queryKey: ["admin", "pendingEdits", page, limit],
    queryFn: () => adminService.getPendingEdits(page, limit),
  });
}

export function useApprovePendingEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (editId: string) => adminService.approvePendingEdit(editId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "pendingEdits"] });
    },
  });
}

export function useRejectPendingEdit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ editId, reason }: { editId: string; reason: string }) =>
      adminService.rejectPendingEdit(editId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin", "pendingEdits"] });
    },
  });
}