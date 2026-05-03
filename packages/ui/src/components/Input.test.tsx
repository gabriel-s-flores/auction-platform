import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  test("renders and forwards native attributes", () => {
    render(<Input aria-label="Email" placeholder="buyer@example.com" type="email" />);

    expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
    expect(screen.getByPlaceholderText("buyer@example.com")).toBeInTheDocument();
  });

  test("handles change, focus, disabled, and shake states", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const onFocus = vi.fn();

    render(<Input aria-label="Valor" onChange={onChange} onFocus={onFocus} shake />);

    await user.type(screen.getByLabelText("Valor"), "123");

    expect(onChange).toHaveBeenCalled();
    expect(onFocus).toHaveBeenCalledTimes(1);

    render(<Input aria-label="Bloqueado" disabled />);
    expect(screen.getByLabelText("Bloqueado")).toBeDisabled();
  });
});
