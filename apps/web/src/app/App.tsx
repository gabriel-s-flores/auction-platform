import { Button } from "@auction/ui";
import { Link, Outlet } from "react-router-dom";

import { useAuth } from "@/shared/auth/auth-context";
import { env } from "@/shared/config/env";

export function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const canAccessAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">{env.appName}</h1>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Leilões online</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <Link
              to="/auctions"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-900"
            >
              Leilões
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/auctions/new"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-900 sm:inline-flex"
                >
                  Criar leilão
                </Link>

                {canAccessAdmin ? (
                  <Link
                    to="/admin"
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-900"
                  >
                    Painel admin
                  </Link>
                ) : null}

                <div className="ml-2 border-l border-stone-200 pl-2">
                  <Button variant="secondary" onClick={() => void logout()} type="button" className="text-sm">
                    Sair
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-900"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                >
                  Cadastrar
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>

      <footer className="border-t border-stone-200 bg-white py-6">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p className="text-sm text-slate-500">{env.appName} — Plataforma de leilões online</p>
          <p className="mt-1 text-xs text-slate-400">Ambiente: {env.appEnv}</p>
        </div>
      </footer>
    </div>
  );
}