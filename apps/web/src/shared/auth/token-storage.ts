const TOKEN_KEY = "auction.accessToken";

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return globalThis.localStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") {
    return;
  }

  globalThis.localStorage.removeItem(TOKEN_KEY);
}
