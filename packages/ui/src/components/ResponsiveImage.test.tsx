import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { ResponsiveImage } from "./ResponsiveImage";

describe("ResponsiveImage", () => {
  test("renders an image with responsive attributes and overlay children", () => {
    render(
      <ResponsiveImage alt="Relogio" src="https://res.cloudinary.com/demo/image/upload/watch.jpg">
        <span>Principal</span>
      </ResponsiveImage>,
    );

    expect(screen.getByRole("img", { name: "Relogio" })).toHaveAttribute("srcset");
    expect(screen.getByText("Principal")).toBeInTheDocument();
  });

  test("renders as an interactive image when onClick is provided", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <ResponsiveImage
        alt="Lote"
        onClick={onClick}
        src="https://res.cloudinary.com/demo/image/upload/lot.jpg"
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("shows the fallback when the image fails to load", () => {
    render(<ResponsiveImage alt="Lote" src="https://example.com/missing.jpg" />);

    fireEvent.error(screen.getByRole("img", { name: "Lote" }));

    expect(screen.getByText("Image not found")).toBeInTheDocument();
  });
});
