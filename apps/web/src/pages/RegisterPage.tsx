import { Alert, Button, Card, FieldError, Input, Label } from "@auction/ui";
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
  const [errors, setErrors] = useState<{ email?: string; name?: string; password?: string }>({});

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement, Event>) {
    event.preventDefault();

    const nextErrors = {
      name: name.trim().length >= 2 ? undefined : "Informe um nome com pelo menos 2 caracteres.",
      email: email.trim() ? undefined : "Informe seu e-mail.",
      password: password.length >= 8 ? undefined : "A senha deve ter pelo menos 8 caracteres.",
    };

    if (nextErrors.name || nextErrors.email || nextErrors.password) {
      setErrors(nextErrors);
      return;
    }

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

        <form className="space-y-3" noValidate onSubmit={(e) => void handleSubmit(e)}>
          <div>
            <Label htmlFor="register-name">Nome</Label>
            <Input
              aria-describedby={errors.name ? "register-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              id="register-name"
              onChange={(event) => {
                setName(event.target.value);
                setErrors((current) => ({ ...current, name: undefined }));
              }}
              value={name}
            />
            <FieldError id="register-name-error">{errors.name}</FieldError>
          </div>

          <div>
            <Label htmlFor="register-email">E-mail</Label>
            <Input
              aria-describedby={errors.email ? "register-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              id="register-email"
              onChange={(event) => {
                setEmail(event.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              type="text"
              value={email}
            />
            <FieldError id="register-email-error">{errors.email}</FieldError>
          </div>

          <div>
            <Label htmlFor="register-password">Senha</Label>
            <Input
              aria-describedby={errors.password ? "register-password-error" : undefined}
              aria-invalid={Boolean(errors.password)}
              autoComplete="new-password"
              id="register-password"
              onChange={(event) => {
                setPassword(event.target.value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              type="password"
              value={password}
            />
            <FieldError id="register-password-error">{errors.password}</FieldError>
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
