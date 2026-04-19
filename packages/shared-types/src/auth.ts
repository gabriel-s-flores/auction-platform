export type UserRole = "USER" | "ADMIN" | "SUPER_ADMIN";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | Date;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  data: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface LoginPayload {
  user: LoginUser;
}

export interface LoginResponse {
  data: LoginPayload;
}

export interface MeResponse {
  data: {
    user: LoginUser;
  };
}

export interface RefreshResponse {
  data: {
    user: LoginUser;
  };
}

export interface LogoutResponse {
  data: {
    message: string;
  };
}