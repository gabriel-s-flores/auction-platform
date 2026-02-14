export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
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

export interface LoginPayload {
  accessToken: string;
}

export interface LoginResponse {
  data: LoginPayload;
}
