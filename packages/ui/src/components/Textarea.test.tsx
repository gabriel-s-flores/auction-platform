import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  test("renders and handles text input", async () => {
    const user = userEvent.setup();

    render(<Textarea aria-label="Descricao" placeholder="Detalhes do lote" />);

    await user.type(screen.getByLabelText("Descricao"), "Lote em bom estado");

    expect(screen.getByPlaceholderText("Detalhes do lote")).toHaveValue("Lote em bom estado");
  });

  test("supports disabled state", () => {
    render(<Textarea aria-label="Descricao" disabled />);

    expect(screen.getByLabelText("Descricao")).toBeDisabled();
  });
});
