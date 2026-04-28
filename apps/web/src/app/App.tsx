import { fadeSlideUp } from "@auction/ui";
import { Button } from "@auction/ui";
import { AnimatePresence, motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/shared/auth/auth-context";
import { env } from "@/shared/config/env";

/** Wrapper que aplica animação de transição ao conteúdo da rota atual */
function AnimatedOutlet() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={fadeSlideUp}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <Outlet />
      </motion.div>
    </AnimatePresence>
  );
}

/** Link de navegação com hover animado */
function NavLink({ to, children, className = "" }: { to: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
      <Link
        to={to}
        className={`rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100 hover:text-slate-900 ${className}`}
      >
        {children}
      </Link>
    </motion.div>
  );
}

export function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const canAccessAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  return (
    <div className="flex min-h-screen flex-col bg-stone-50 text-slate-900">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600"
              whileHover={{ rotate: -10, scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 20 } }}
            >
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                />
              </svg>
            </motion.div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-slate-900">{env.appName}</h1>
              <p className="text-[10px] uppercase tracking-wide text-slate-500">Leilões online</p>
            </div>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            <NavLink to="/auctions">Leilões</NavLink>

            {isAuthenticated ? (
              <>
                <NavLink to="/account">Meu painel</NavLink>

                <NavLink to="/auctions/new" className="hidden sm:inline-flex">
                  Criar leilão
                </NavLink>

                {canAccessAdmin ? (
                  <NavLink to="/admin">Painel admin</NavLink>
                ) : null}

                <div className="ml-2 border-l border-stone-200 pl-2">
                  <Button variant="secondary" onClick={() => void logout()} type="button" className="text-sm">
                    Sair
                  </Button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Entrar</NavLink>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/register"
                    className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-amber-700"
                  >
                    Cadastrar
                  </Link>
                </motion.div>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:py-8">
        <AnimatedOutlet />
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