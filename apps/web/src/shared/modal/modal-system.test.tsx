import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { PropsWithChildren } from "react";
import { describe, expect, test } from "vitest";

import { getModalManager, ModalProvider } from "./modal-context";
import { alert, confirm } from "./use-modal";

function TestWrapper({ children }: PropsWithChildren) {
  return <ModalProvider>{children}</ModalProvider>;
}

describe("modal system", () => {
  test("confirm resolves with true after clicking primary button", async () => {
    const user = userEvent.setup();
    let result: boolean | null = null;

    async function runConfirm() {
      result = await confirm("Deseja prosseguir?");
    }

    render(<TestWrapper><button type="button" onClick={() => { void runConfirm(); }}>Trigger</button></TestWrapper>);

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(result).toBe(true);
  });

  test("confirm resolves with false after clicking secondary button", async () => {
    const user = userEvent.setup();
    let result: boolean | null = null;

    async function runConfirm() {
      result = await confirm("Deseja prosseguir?");
    }

    render(<TestWrapper><button type="button" onClick={() => { void runConfirm(); }}>Trigger</button></TestWrapper>);

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(result).toBe(false);
  });

  test("confirm resolves with false after Escape key", async () => {
    const user = userEvent.setup();
    let result: boolean | null = null;

    async function runConfirm() {
      result = await confirm("Deseja prosseguir?");
    }

    render(<TestWrapper><button type="button" onClick={() => { void runConfirm(); }}>Trigger</button></TestWrapper>);

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.keyboard("{Escape}");

    expect(result).toBe(false);
  });

  test("alert resolves after clicking OK button", async () => {
    const user = userEvent.setup();
    let resolved = false;

    async function runAlert() {
      await alert("Operação concluída com sucesso.");
      resolved = true;
    }

    render(<TestWrapper><button type="button" onClick={() => { void runAlert(); }}>Trigger</button></TestWrapper>);

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(resolved).toBe(true);
  });

  test("stacked modals render in order", async () => {
    const user = userEvent.setup();
    let firstResult: boolean | null = null;
    let secondResult: boolean | null = null;

    async function runStacked() {
      firstResult = await confirm("Primeiro modal?");
      secondResult = await confirm("Segundo modal?");
    }

    render(<TestWrapper><button type="button" onClick={() => { void runStacked(); }}>Trigger</button></TestWrapper>);

    await user.click(screen.getByRole("button", { name: "Trigger" }));

    expect(screen.getByText("Primeiro modal?")).toBeInTheDocument();

    await user.click(screen.getAllByRole("button", { name: "Confirmar" })[0]!);

    expect(screen.getByText("Segundo modal?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(firstResult).toBe(true);
    expect(secondResult).toBe(true);
  });

  test("getModalManager throws clear error without Provider", () => {
    expect(() => getModalManager()).toThrow("ModalManager is not initialized");
  });
});
