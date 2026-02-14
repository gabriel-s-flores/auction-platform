import { Link, Outlet } from "react-router-dom";
import { Button } from "@auction/ui";
import { env } from "@/shared/config/env";
import { useAuth } from "@/shared/auth/auth-context";

export function App() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-xl font-bold">{env.appName}</h1>
            <p className="text-xs text-slate-500">Ambiente: {env.appEnv}</p>
          </div>

          <nav className="flex items-center gap-2">
            <Link className="text-sm font-medium text-primary-700 hover:underline" to="/auctions">
              Leilões
            </Link>

            {isAuthenticated ? (
              <>
                <Link className="text-sm font-medium text-primary-700 hover:underline" to="/auctions/new">
                  Criar leilão
                </Link>
                <Button variant="secondary" onClick={logout} type="button">
                  Sair
                </Button>
              </>
            ) : (
              <>
                <Link className="text-sm font-medium text-primary-700 hover:underline" to="/login">
                  Entrar
                </Link>
                <Link className="text-sm font-medium text-primary-700 hover:underline" to="/register">
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
