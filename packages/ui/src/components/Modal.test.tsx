import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";

import { Modal, type ModalProps } from "./Modal";

type ModalTestWrapperProps = Omit<ModalProps, "isOpen" | "onAction"> & {
  defaultOpen?: boolean;
};

function ModalTestWrapper({ defaultOpen = true, ...props }: ModalTestWrapperProps) {
  return <Modal {...props} isOpen={defaultOpen} onAction={vi.fn()} />;
}

describe("Modal", () => {
  test("does not render when isOpen is false", () => {
    render(<ModalTestWrapper title="Título" message="Mensagem" buttons={[]} defaultOpen={false} />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  test("renders title, message and buttons when open", () => {
    render(
      <ModalTestWrapper
        title="Confirmar ação"
        message="Deseja prosseguir?"
        buttons={[
          { label: "Cancelar", variant: "secondary", action: "cancel" },
          { label: "Confirmar", variant: "primary", action: "confirm" },
        ]}
      />
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Confirmar ação" })).toBeInTheDocument();
    expect(screen.getByText("Deseja prosseguir?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  test("calls onAction with cancel on backdrop click", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();
    const { container } = render(
      <Modal
        isOpen
        title="Título"
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={onAction}
      />
    );

    const backdrop = container.querySelector(".bg-black\\/40");
    expect(backdrop).toBeInTheDocument();

    await user.click(backdrop!);

    expect(onAction).toHaveBeenCalledWith("cancel");
  });

  test("calls onAction with cancel on Escape key", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <Modal
        isOpen
        title="Título"
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={onAction}
      />
    );

    await user.keyboard("{Escape}");

    expect(onAction).toHaveBeenCalledWith("cancel");
  });

  test("calls onAction with confirm on primary button click", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <Modal
        isOpen
        message="Deseja prosseguir?"
        buttons={[
          { label: "Cancelar", variant: "secondary", action: "cancel" },
          { label: "Confirmar", variant: "primary", action: "confirm" },
        ]}
        onAction={onAction}
      />
    );

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onAction).toHaveBeenCalledWith("confirm");
  });

  test("calls onAction with cancel on secondary button click", async () => {
    const user = userEvent.setup();
    const onAction = vi.fn();

    render(
      <Modal
        isOpen
        message="Deseja prosseguir?"
        buttons={[
          { label: "Cancelar", variant: "secondary", action: "cancel" },
          { label: "Confirmar", variant: "primary", action: "confirm" },
        ]}
        onAction={onAction}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onAction).toHaveBeenCalledWith("cancel");
  });

  test("uses amber accent and icon for info variant", () => {
    const { container } = render(
      <Modal
        isOpen
        variant="info"
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={vi.fn()}
      />
    );

    const accentBar = container.querySelector(".bg-amber-500");
    const iconWrapper = container.querySelector(".bg-amber-50");

    expect(accentBar).toBeInTheDocument();
    expect(iconWrapper).toBeInTheDocument();
  });

  test("uses rose accent and icon for destructive variant", () => {
    const { container } = render(
      <Modal
        isOpen
        variant="destructive"
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={vi.fn()}
      />
    );

    const accentBar = container.querySelector(".bg-rose-500");
    const iconWrapper = container.querySelector(".bg-rose-50");

    expect(accentBar).toBeInTheDocument();
    expect(iconWrapper).toBeInTheDocument();
  });

  test("does not render title element when title is omitted", () => {
    render(
      <Modal
        isOpen
        message="Mensagem sem título"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={vi.fn()}
      />
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });

  test("focuses the first button when opened", () => {
    render(
      <Modal
        isOpen
        title="Título"
        message="Mensagem"
        buttons={[
          { label: "Cancelar", variant: "secondary", action: "cancel" },
          { label: "Confirmar", variant: "primary", action: "confirm" },
        ]}
        onAction={vi.fn()}
      />
    );

    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Cancelar" }));
  });

  test("blocks body scroll while open", () => {
    render(
      <Modal
        isOpen
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={vi.fn()}
      />
    );

    expect(document.body.style.overflow).toBe("hidden");
  });

  test("restores body scroll on unmount", () => {
    const originalOverflow = document.body.style.overflow;
    const { unmount } = render(
      <Modal
        isOpen
        message="Mensagem"
        buttons={[{ label: "OK", action: "confirm" }]}
        onAction={vi.fn()}
      />
    );

    unmount();

    expect(document.body.style.overflow).toBe(originalOverflow);
  });
});
