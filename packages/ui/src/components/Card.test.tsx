import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  test("renders children with base card styles", () => {
    render(<Card data-testid="card">Conteudo</Card>);

    expect(screen.getByTestId("card")).toHaveClass("rounded-xl", "border", "bg-white");
    expect(screen.getByText("Conteudo")).toBeInTheDocument();
  });

  test("accepts disabled animation props without dropping attributes", () => {
    render(
      <Card data-testid="card" disableEntrance disableHover id="auction-card">
        Lote
      </Card>,
    );

    expect(screen.getByTestId("card")).toHaveAttribute("id", "auction-card");
  });
});
