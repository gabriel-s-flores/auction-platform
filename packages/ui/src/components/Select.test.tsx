import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { Select } from "./Select";

describe("Select", () => {
  test("renders options and handles selection", async () => {
    const user = userEvent.setup();

    render(
      <Select aria-label="Status" defaultValue="open">
        <option value="open">Aberto</option>
        <option value="closed">Encerrado</option>
      </Select>,
    );

    await user.selectOptions(screen.getByLabelText("Status"), "closed");

    expect(screen.getByLabelText("Status")).toHaveValue("closed");
  });

  test("supports disabled state", () => {
    render(<Select aria-label="Status" disabled />);

    expect(screen.getByLabelText("Status")).toBeDisabled();
  });
});
