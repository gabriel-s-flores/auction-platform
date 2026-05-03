import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { StateMessage } from "./StateMessage";

describe("StateMessage", () => {
  test("renders default and error variants", () => {
    const { rerender } = render(<StateMessage>Nenhum item</StateMessage>);

    expect(screen.getByText("Nenhum item")).toHaveClass("text-slate-500");

    rerender(<StateMessage variant="error">Falha</StateMessage>);
    expect(screen.getByText("Falha")).toHaveClass("text-rose-700");
  });
});
