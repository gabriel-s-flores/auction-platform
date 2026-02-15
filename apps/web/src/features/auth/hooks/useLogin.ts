import type { LoginRequest } from "@auction/shared-types";
import { useMutation } from "@tanstack/react-query";

import { authService } from "@/features/auth/services/auth.service";
import { useAuth } from "@/shared/auth/auth-context";

export function useLogin() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: (payload: LoginRequest) => authService.login(payload),
    onSuccess: (result: { accessToken: string }) => {
      login(result.accessToken);
    }
  });
}
