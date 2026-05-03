import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { FormField } from "./FormField";
import { Input } from "./Input";

describe("FormField", () => {
  test("connects label, hint, and error content", () => {
    render(
      <FormField error="Valor obrigatorio" errorId="bid-error" hint="Use numeros" id="bid" label="Lance">
        <Input aria-describedby="bid-error" id="bid" />
      </FormField>,
    );

    expect(screen.getByLabelText("Lance")).toBeInTheDocument();
    expect(screen.getByText("Use numeros")).toBeInTheDocument();
    expect(screen.getByText("Valor obrigatorio")).toHaveAttribute("id", "bid-error");
  });
});
