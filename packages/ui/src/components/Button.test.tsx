import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  test("renders children with the primary variant by default", () => {
    render(<Button>Confirmar</Button>);

    expect(screen.getByRole("button", { name: "Confirmar" })).toHaveClass("bg-amber-600");
  });

  test("supports secondary and disabled states", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick} variant="secondary">
        Encerrado
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Encerrado" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveClass("bg-slate-100");
    expect(onClick).not.toHaveBeenCalled();
  });
});
