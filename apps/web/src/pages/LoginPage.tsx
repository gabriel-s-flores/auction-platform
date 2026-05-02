import { Alert, Button, Card, FieldError, Input, Label } from "@auction/ui";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useLogin } from "@/features/auth/hooks/useLogin";
import { getErrorMessage } from "@/shared/api/get-error-message";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/auctions";

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, Event>) {
    event.preventDefault();

    const nextErrors = {
      email: email.trim() ? undefined : "Informe seu e-mail.",
      password: password ? undefined : "Informe sua senha.",
    };

    if (nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

    await loginMutation.mutateAsync({ email, password });
    void navigate(redirectTo, { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Entrar</h2>
          <p className="text-sm text-slate-600">Acesse sua conta para participar dos leilões.</p>
        </div>

        {loginMutation.isError ? (
          <Alert variant="error">
            {getErrorMessage(loginMutation.error, "Falha ao autenticar")}
          </Alert>
        ) : null}

        <form className="space-y-3" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="login-email">E-mail</Label>
            <Input
              aria-describedby={errors.email ? "login-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              id="login-email"
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              type="text"
              value={email}
            />
            <FieldError id="login-email-error">{errors.email}</FieldError>
          </div>

          <div>
            <Label htmlFor="login-password">Senha</Label>
            <Input
              aria-describedby={errors.password ? "login-password-error" : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="current-password"
              id="login-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              type="password"
              value={password}
            />
            <FieldError id="login-password-error">{errors.password}</FieldError>
          </div>

          <Button className="w-full" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Ainda não tem conta?{" "}
          <Link className="text-primary-700 font-semibold hover:underline" to="/register">
            Cadastre-se
          </Link>
        </p>
      </Card>
    </div>
  );
}
