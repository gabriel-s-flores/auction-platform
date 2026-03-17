import { Alert, Button, Card, Input, Label } from "@auction/ui";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useRegister } from "@/features/auth/hooks/useRegister";
import { getErrorMessage } from "@/shared/api/get-error-message";

export function RegisterPage() {
  const navigate = useNavigate();
  const registerMutation = useRegister();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, Event>) {
    event.preventDefault();

    await registerMutation.mutateAsync({ name, email, password });
    void navigate("/login", { replace: true });
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Cadastro</h2>
          <p className="text-sm text-slate-600">
            Crie sua conta para vender e participar de leilões.
          </p>
        </div>

        {registerMutation.isError ? (
          <Alert variant="error">
            {getErrorMessage(registerMutation.error, "Falha ao cadastrar")}
          </Alert>
        ) : null}

        {registerMutation.isSuccess ? (
          <Alert variant="success">Cadastro concluído com sucesso! Agora faça login.</Alert>
        ) : null}

        <form className="space-y-3" onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="register-name">Nome</Label>
            <Input
              id="register-name"
              minLength={2}
              onChange={(event) => setName(event.target.value)}
              required
              value={name}
            />
          </div>

          <div>
            <Label htmlFor="register-email">E-mail</Label>
            <Input
              id="register-email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <Label htmlFor="register-password">Senha</Label>
            <Input
              autoComplete="new-password"
              id="register-password"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </div>

          <Button className="w-full" disabled={registerMutation.isPending} type="submit">
            {registerMutation.isPending ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>

        <p className="text-sm text-slate-600">
          Já possui conta?{" "}
          <Link className="text-primary-700 font-semibold hover:underline" to="/login">
            Entrar
          </Link>
        </p>
      </Card>
    </div>
  );
}
