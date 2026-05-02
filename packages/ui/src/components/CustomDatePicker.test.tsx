import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { CustomDatePicker } from "./CustomDatePicker";

describe("CustomDatePicker", () => {
  test("opens a styled calendar popover and emits a date-only value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDatePicker
        id="activity-log-start-date"
        value="2026-05-02"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "02/05/2026" }));
    const dialog = screen.getByRole("dialog", { name: "Calendário" });

    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/maio de 2026/i)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "15" }));

    expect(onChange).toHaveBeenCalledWith("2026-05-15");
    expect(screen.queryByRole("dialog", { name: "Calendário" })).not.toBeInTheDocument();
  });

  test("keeps the popover open for date-time selection and preserves the time segment", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDatePicker
        includeTime
        id="auction-ends-at"
        value="2026-05-02T14:30"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /02\/05\/2026, 14:30/i }));
    const dialog = screen.getByRole("dialog", { name: "Calendário" });

    await user.click(within(dialog).getByRole("button", { name: "15" }));

    expect(onChange).toHaveBeenCalledWith("2026-05-15T14:30");
    expect(screen.getByRole("dialog", { name: "Calendário" })).toBeInTheDocument();
  });

  test("updates time text without using a native time input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDatePicker
        includeTime
        id="auction-ends-at"
        value="2026-05-02T14:30"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: /02\/05\/2026, 14:30/i }));
    const timeInput = screen.getByLabelText("Hora");

    expect(timeInput).toHaveAttribute("type", "text");

    await user.clear(timeInput);
    await user.type(timeInput, "09:45");

    expect(onChange).toHaveBeenLastCalledWith("2026-05-02T09:45");
  });

  test("supports keyboard day navigation before selecting", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <CustomDatePicker
        id="activity-log-start-date"
        value="2026-05-02"
        onChange={onChange}
      />
    );

    await user.click(screen.getByRole("button", { name: "02/05/2026" }));
    const selectedDay = within(screen.getByRole("dialog", { name: "Calendário" })).getByRole(
      "button",
      { name: "2" }
    );

    selectedDay.focus();
    await user.keyboard("{ArrowRight}{Enter}");

    expect(onChange).toHaveBeenCalledWith("2026-05-03");
  });

  test("closes when the user clicks outside the popover", async () => {
    const user = userEvent.setup();

    render(
      <div>
        <CustomDatePicker id="activity-log-end-date" value="2026-05-02" onChange={vi.fn()} />
        <button type="button">Fora</button>
      </div>
    );

    await user.click(screen.getByRole("button", { name: "02/05/2026" }));
    expect(screen.getByRole("dialog", { name: "Calendário" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fora" }));

    expect(screen.queryByRole("dialog", { name: "Calendário" })).not.toBeInTheDocument();
  });
});
