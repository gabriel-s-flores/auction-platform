import axios, { type InternalAxiosRequestConfig } from "axios";

import { getAccessToken } from "@/shared/auth/token-storage";
import { env } from "@/shared/config/env";

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
