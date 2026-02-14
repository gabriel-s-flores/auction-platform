import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/shared/auth/token-storage";

interface AuthContextValue {
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => getAccessToken());

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login: (token: string) => {
        setAccessToken(token);
        setAccessTokenState(token);
      },
      logout: () => {
        clearAccessToken();
        setAccessTokenState(null);
      }
    }),
    [accessToken]
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
