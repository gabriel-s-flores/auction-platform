import type { ModalVariant } from "@auction/ui";

import { getModalManager } from "./modal-context";

type ConfirmOptions = {
  variant?: ModalVariant;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type AlertOptions = {
  title?: string;
  confirmLabel?: string;
};

export async function confirm(message: string, options?: ConfirmOptions): Promise<boolean> {
  const manager = getModalManager();

  const result = await manager.open({
    message,
    title: options?.title ?? "Confirmar ação",
    variant: options?.variant ?? "info",
    buttons: [
      {
        label: options?.cancelLabel ?? "Cancelar",
        variant: "secondary",
        action: "cancel",
      },
      {
        label: options?.confirmLabel ?? "Confirmar",
        variant: "primary",
        action: "confirm",
      },
    ],
  });

  return result.action === "confirm";
}

export async function alert(message: string, options?: AlertOptions): Promise<void> {
  const manager = getModalManager();

  await manager.open({
    message,
    title: options?.title ?? "Atenção",
    variant: "info",
    buttons: [
      {
        label: options?.confirmLabel ?? "OK",
        variant: "primary",
        action: "confirm",
      },
    ],
  });
}
