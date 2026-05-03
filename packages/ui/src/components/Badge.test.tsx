import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  test("renders the neutral variant by default", () => {
    render(<Badge>Status</Badge>);

    expect(screen.getByText("Status")).toHaveClass("bg-slate-100");
  });

  test("supports success and danger variants", () => {
    const { rerender } = render(<Badge variant="success">Aberto</Badge>);

    expect(screen.getByText("Aberto")).toHaveClass("bg-emerald-100");

    rerender(<Badge variant="danger">Encerrado</Badge>);
    expect(screen.getByText("Encerrado")).toHaveClass("bg-rose-100");
  });
});
