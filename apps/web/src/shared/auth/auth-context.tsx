import { createContext, type PropsWithChildren, useContext, useMemo, useState } from "react";

import {
  clearAccessToken,
  getAccessToken,
  getUserFromToken,
  setAccessToken as setStoredToken,
} from "@/shared/auth/token-storage";

interface User {
  id: string;
  role: "USER" | "ADMIN";
}

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());

  const user = useMemo(() => {
    if (!accessToken) return null;
    return getUserFromToken();
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      user,
      login: (token: string) => {
        setStoredToken(token);
        setAccessTokenState(token);
      },
      logout: () => {
        clearAccessToken();
        setAccessTokenState(null);
      },
    }),
    [accessToken, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}
