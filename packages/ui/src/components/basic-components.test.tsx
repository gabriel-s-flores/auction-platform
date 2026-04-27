import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Alert } from "./Alert";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";
import { Label } from "./Label";

describe("basic UI components", () => {
  test("renders badge and alert variants with caller props", () => {
    render(
      <>
        <Badge data-testid="badge" variant="success">
          Aberto
        </Badge>
        <Alert role="alert" variant="error">
          Falha ao carregar
        </Alert>
      </>
    );

    expect(screen.getByTestId("badge")).toHaveClass("bg-emerald-100");
    expect(screen.getByText("Aberto")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("border-rose-200");
  });

  test("keeps disabled buttons inert", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Enviar
      </Button>
    );

    await user.click(screen.getByRole("button", { name: "Enviar" }));

    expect(onClick).not.toHaveBeenCalled();
  });

  test("connects labels to inputs and renders card content", async () => {
    const user = userEvent.setup();

    render(
      <Card>
        <Label htmlFor="bid-amount">Valor do lance</Label>
        <Input id="bid-amount" type="number" />
      </Card>
    );

    await user.type(screen.getByLabelText("Valor do lance"), "150");

    expect(screen.getByLabelText("Valor do lance")).toHaveValue(150);
  });
});
