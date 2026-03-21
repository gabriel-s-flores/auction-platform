const TOKEN_KEY = "auction.accessToken";

interface JwtPayload {
  sub: string;
  role: "USER" | "ADMIN";
  iat: number;
  exp: number;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

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

export function getUserFromToken(): { id: string; role: "USER" | "ADMIN" } | null {
  const token = getAccessToken();
  if (!token) return null;
  const payload = decodeJwt(token);
  if (!payload) return null;
  return { id: payload.sub, role: payload.role };
}
