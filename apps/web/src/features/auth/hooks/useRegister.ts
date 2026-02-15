import type { RegisterRequest } from "@auction/shared-types";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/auth/services/auth.service";

export function useRegister() {
  return useMutation({
    mutationFn: (payload: RegisterRequest) => authService.register(payload)
  });
}
