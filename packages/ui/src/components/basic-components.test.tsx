import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Alert } from "./Alert";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { FormField } from "./FormField";
import { Input } from "./Input";
import { Label } from "./Label";
import { Pagination } from "./Pagination";
import { Select } from "./Select";
import { StateMessage } from "./StateMessage";
import { Textarea } from "./Textarea";

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

  test("renders form primitives with accessible labels", async () => {
    const user = userEvent.setup();

    render(
      <FormField id="auction-status" label="Status">
        <Select id="auction-status" defaultValue="">
          <option value="">Todos</option>
          <option value="open">Aberto</option>
        </Select>
      </FormField>
    );

    await user.selectOptions(screen.getByLabelText("Status"), "open");

    expect(screen.getByLabelText("Status")).toHaveValue("open");
  });

  test("renders textarea, state message, and pagination controls", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(
      <>
        <Textarea aria-label="Descrição" defaultValue="Lote em bom estado" />
        <StateMessage>Nenhum item encontrado.</StateMessage>
        <Pagination currentPage={2} totalPages={3} onPageChange={onPageChange} />
      </>
    );

    expect(screen.getByLabelText("Descrição")).toHaveValue("Lote em bom estado");
    expect(screen.getByText("Nenhum item encontrado.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPageChange).toHaveBeenCalledWith(3);
  });
});
