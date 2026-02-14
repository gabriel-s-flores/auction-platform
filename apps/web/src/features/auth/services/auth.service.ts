import type {
  LoginPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse
} from "@auction/shared-types";
import { httpClient } from "@/shared/api/http-client";

async function login(payload: LoginRequest): Promise<LoginPayload> {
  const { data } = await httpClient.post<LoginResponse>("/auth/login", payload);
  return data.data;
}

async function register(payload: RegisterRequest): Promise<RegisterResponse["data"]> {
  const { data } = await httpClient.post<RegisterResponse>("/auth/register", payload);
  return data.data;
}

export const authService = {
  login,
  register
};
