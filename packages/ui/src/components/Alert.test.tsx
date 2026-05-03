import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Alert } from "./Alert";

describe("Alert", () => {
  test("renders visible info alerts by default", () => {
    render(<Alert>Leilao atualizado</Alert>);

    expect(screen.getByRole("alert")).toHaveClass("border-sky-200");
    expect(screen.getByText("Leilao atualizado")).toBeInTheDocument();
  });

  test("supports success, error, and hidden states", () => {
    const { rerender } = render(<Alert variant="success">Salvo</Alert>);

    expect(screen.getByRole("alert")).toHaveClass("border-emerald-200");

    rerender(<Alert variant="error">Falha</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("border-rose-200");

    rerender(<Alert visible={false}>Oculto</Alert>);
    expect(screen.queryByText("Oculto")).not.toBeInTheDocument();
  });
});
