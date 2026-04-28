import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Alert } from "./Alert";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Card } from "./Card";
import { Input } from "./Input";

describe("animated Button", () => {
  test("renders as a button element with correct text", () => {
    render(<Button>Enviar</Button>);
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
  });

  test("applies primary variant classes by default", () => {
    render(<Button>Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-amber-600");
  });

  test("applies secondary variant classes", () => {
    render(<Button variant="secondary">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-slate-100");
  });

  test("merges custom className", () => {
    render(<Button className="custom-class">Test</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
    // Should also keep the base classes
    expect(screen.getByRole("button")).toHaveClass("inline-flex");
  });

  test("disabled button does not fire onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <Button disabled onClick={onClick}>
        Enviar
      </Button>
    );

    await user.click(screen.getByRole("button", { name: "Enviar" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("passes HTML button attributes through", () => {
    render(<Button type="submit" data-testid="submit-btn">Submit</Button>);
    const btn = screen.getByTestId("submit-btn");
    expect(btn).toHaveAttribute("type", "submit");
  });

  test("renders children correctly", () => {
    render(<Button><span>Complex</span> Content</Button>);
    expect(screen.getByText("Complex")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });
});

describe("animated Card", () => {
  test("renders as a div with card styles", () => {
    render(<Card data-testid="card">Content</Card>);
    const card = screen.getByTestId("card");
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveClass("rounded-xl");
    expect(card).toHaveClass("border");
    expect(card).toHaveClass("bg-white");
  });

  test("renders children", () => {
    render(<Card>Card Content</Card>);
    expect(screen.getByText("Card Content")).toBeInTheDocument();
  });

  test("merges custom className", () => {
    render(<Card className="my-custom" data-testid="card">X</Card>);
    expect(screen.getByTestId("card")).toHaveClass("my-custom");
    expect(screen.getByTestId("card")).toHaveClass("rounded-xl");
  });

  test("accepts additional HTML attributes", () => {
    render(<Card id="my-card" data-testid="card">X</Card>);
    expect(screen.getByTestId("card")).toHaveAttribute("id", "my-card");
  });
});

describe("animated Alert", () => {
  test("renders with role alert when visible", () => {
    render(<Alert>Something happened</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something happened")).toBeInTheDocument();
  });

  test("does not render when visible=false", () => {
    render(<Alert visible={false}>Hidden</Alert>);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  test("applies info variant styles by default", () => {
    render(<Alert>Info</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("border-sky-200");
    expect(screen.getByRole("alert")).toHaveClass("bg-sky-50");
  });

  test("applies success variant styles", () => {
    render(<Alert variant="success">Success</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("border-emerald-200");
    expect(screen.getByRole("alert")).toHaveClass("bg-emerald-50");
  });

  test("applies error variant styles", () => {
    render(<Alert variant="error">Error</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("border-rose-200");
    expect(screen.getByRole("alert")).toHaveClass("bg-rose-50");
  });

  test("merges custom className", () => {
    render(<Alert className="extra-class">X</Alert>);
    expect(screen.getByRole("alert")).toHaveClass("extra-class");
    expect(screen.getByRole("alert")).toHaveClass("rounded-lg");
  });
});

describe("animated Badge", () => {
  test("renders with correct text", () => {
    render(<Badge>Online</Badge>);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  test("applies neutral variant styles by default", () => {
    render(<Badge data-testid="badge">Neutral</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-slate-100");
    expect(screen.getByTestId("badge")).toHaveClass("text-slate-700");
  });

  test("applies success variant styles", () => {
    render(<Badge variant="success" data-testid="badge">Success</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-emerald-100");
    expect(screen.getByTestId("badge")).toHaveClass("text-emerald-700");
  });

  test("applies danger variant styles", () => {
    render(<Badge variant="danger" data-testid="badge">Danger</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("bg-rose-100");
    expect(screen.getByTestId("badge")).toHaveClass("text-rose-700");
  });

  test("renders as a span element", () => {
    render(<Badge data-testid="badge">Tag</Badge>);
    expect(screen.getByTestId("badge").tagName).toBe("SPAN");
  });

  test("merges custom className", () => {
    render(<Badge className="custom" data-testid="badge">X</Badge>);
    expect(screen.getByTestId("badge")).toHaveClass("custom");
    expect(screen.getByTestId("badge")).toHaveClass("rounded-full");
  });
});

describe("animated Input", () => {
  test("renders as an input element", () => {
    render(<Input data-testid="input" />);
    expect(screen.getByTestId("input").tagName).toBe("INPUT");
  });

  test("accepts and applies type attribute", () => {
    render(<Input type="email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("type", "email");
  });

  test("accepts placeholder", () => {
    render(<Input placeholder="Enter email" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveAttribute("placeholder", "Enter email");
  });

  test("supports disabled state", () => {
    render(<Input disabled data-testid="input" />);
    expect(screen.getByTestId("input")).toBeDisabled();
    expect(screen.getByTestId("input")).toHaveClass("disabled:cursor-not-allowed");
  });

  test("fires onChange event", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<Input onChange={onChange} data-testid="input" />);
    await user.type(screen.getByTestId("input"), "hello");

    expect(onChange).toHaveBeenCalled();
  });

  test("fires onFocus and onBlur events", async () => {
    const user = userEvent.setup();
    const onFocus = vi.fn();
    const onBlur = vi.fn();

    render(<Input onFocus={onFocus} onBlur={onBlur} data-testid="input" />);

    const input = screen.getByTestId("input");
    await user.click(input);
    expect(onFocus).toHaveBeenCalledTimes(1);

    await user.tab();
    expect(onBlur).toHaveBeenCalledTimes(1);
  });

  test("accepts shake prop without crashing", () => {
    render(<Input shake data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  test("shake=false does not cause issues", () => {
    render(<Input shake={false} data-testid="input" />);
    expect(screen.getByTestId("input")).toBeInTheDocument();
  });

  test("merges custom className", () => {
    render(<Input className="my-input" data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveClass("my-input");
    expect(screen.getByTestId("input")).toHaveClass("w-full");
  });

  test("works as a controlled input", async () => {
    const user = userEvent.setup();
    let value = "";
    const onChange = vi.fn((e: React.ChangeEvent<HTMLInputElement>) => {
      value = e.target.value;
    });

    const { rerender } = render(
      <Input value={value} onChange={onChange} data-testid="input" />
    );

    await user.type(screen.getByTestId("input"), "test");
    expect(onChange).toHaveBeenCalled();

    // Simulate re-render with updated value
    rerender(<Input value="test" onChange={onChange} data-testid="input" />);
    expect(screen.getByTestId("input")).toHaveValue("test");
  });
});