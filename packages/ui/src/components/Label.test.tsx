import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";

import { Label } from "./Label";

describe("Label", () => {
  test("renders text linked to a control", () => {
    render(
      <>
        <Label htmlFor="title">Titulo</Label>
        <input id="title" />
      </>,
    );

    expect(screen.getByLabelText("Titulo")).toBeInTheDocument();
  });
});
