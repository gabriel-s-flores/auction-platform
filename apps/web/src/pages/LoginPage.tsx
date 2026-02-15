import { Alert, Button, Card, Input, Label } from "@auction/ui";
import { type FormEvent,useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { getErrorMessage } from "@/shared/api/get-error-message";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/auctions";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await loginMutation.mutateAsync({ email, password });
    navigate(redirectTo, { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
          <p className="text-sm text-slate-600">Acesse sua conta para participar dos leilões.</p>
        </div>

        {loginMutation.isError ? (
          <Alert variant="error">{getErrorMessage(loginMutation.error, "Falha ao autenticar")}</Alert>
        ) : null}

        <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              id="login-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <Label htmlFor="login-password">Senha</Label>
            <Input
              id="login-password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          <Button className="w-full" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link className="font-semibold text-primary-700 hover:underline" to="/register">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
