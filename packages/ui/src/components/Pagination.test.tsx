import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Pagination } from "./Pagination";

describe("Pagination", () => {
  test("does not render for a single page", () => {
    render(<Pagination currentPage={1} onPageChange={vi.fn()} totalPages={1} />);

    expect(screen.queryByRole("navigation", { name: "Paginação" })).not.toBeInTheDocument();
  });

  test("moves to previous and next pages within bounds", async () => {
    const user = userEvent.setup();
    const onPageChange = vi.fn();

    render(<Pagination currentPage={2} onPageChange={onPageChange} totalPages={3} />);

    await user.click(screen.getByRole("button", { name: "Anterior" }));
    await user.click(screen.getByRole("button", { name: "Próxima" }));

    expect(onPageChange).toHaveBeenNthCalledWith(1, 1);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 3);
  });
});
