import type { ModalConfig, ModalResult } from "@auction/ui";
import { Modal } from "@auction/ui";
import type { PropsWithChildren } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

type PendingModal = ModalConfig & {
  resolve: (result: ModalResult) => void;
};

type ModalManager = {
  open: (config: Omit<ModalConfig, "id">) => Promise<ModalResult>;
};

const modalManagerRef: { current: ModalManager | null } = { current: null };

export function getModalManager(): ModalManager {
  if (!modalManagerRef.current) {
    throw new Error("ModalManager is not initialized. Ensure ModalProvider is rendered.");
  }
  return modalManagerRef.current;
}

export function ModalProvider({ children }: PropsWithChildren) {
  const [pending, setPending] = useState<PendingModal[]>([]);
  const counterRef = useRef(0);

  const open = useCallback((config: Omit<ModalConfig, "id">): Promise<ModalResult> => {
    return new Promise<ModalResult>((resolve) => {
      counterRef.current += 1;
      const id = `modal-${counterRef.current}`;
      setPending((prev) => [...prev, { ...config, id, resolve }]);
    });
  }, []);

  useEffect(() => {
    const manager: ModalManager = { open };
    modalManagerRef.current = manager;
    return () => {
      modalManagerRef.current = null;
    };
  }, [open]);

  const handleAction = useCallback((id: string, action: "confirm" | "cancel") => {
    setPending((prev) => {
      const target = prev.find((m) => m.id === id);
      if (target) {
        target.resolve({ action });
      }
      return prev.filter((m) => m.id !== id);
    });
  }, []);

  return (
    <>
      {children}
      {pending.map((modal) => (
        <Modal
          key={modal.id}
          isOpen
          title={modal.title}
          message={modal.message}
          variant={modal.variant}
          buttons={modal.buttons}
          onAction={(action) => handleAction(modal.id, action)}
        />
      ))}
    </>
  );
}
