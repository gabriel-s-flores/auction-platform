import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { FieldError } from "./FieldError";

describe("FieldError", () => {
  test("renders accessible validation text when a message is provided", () => {
    render(<FieldError id="price-error">Informe um preço inicial válido.</FieldError>);

    const error = screen.getByRole("alert");

    expect(error).toHaveAttribute("id", "price-error");
    expect(error).toHaveTextContent("Informe um preço inicial válido.");
    expect(error).toHaveClass("text-rose-600");
  });

  test("renders nothing when the message is empty", () => {
    const { container } = render(<FieldError id="empty-error">{null}</FieldError>);

    expect(container).toBeEmptyDOMElement();
  });
});
