import axios from "axios";

export function getErrorMessage(error: unknown, fallback = "Ocorreu um erro inesperado") {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as { error?: string } | undefined;
    return payload?.error ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
