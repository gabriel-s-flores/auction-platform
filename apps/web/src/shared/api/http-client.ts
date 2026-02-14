import axios, { type InternalAxiosRequestConfig } from "axios";
import { env } from "@/shared/config/env";
import { getAccessToken } from "@/shared/auth/token-storage";

export const httpClient = axios.create({
  baseURL: env.apiBaseUrl
});

httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }

  return config;
});
