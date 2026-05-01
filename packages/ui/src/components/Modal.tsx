import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";

import { scaleIn } from "../utils/animation-utils";
import { Button } from "./Button";

export type ModalVariant = "info" | "destructive";

export type ModalButtonConfig = {
  label: string;
  variant?: "primary" | "secondary";
  action: "confirm" | "cancel";
};

export type ModalConfig = {
  id: string;
  title?: string;
  message: string;
  variant?: ModalVariant;
  buttons: ModalButtonConfig[];
};

export type ModalResult = {
  action: "confirm" | "cancel";
};

export type ModalProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  variant?: ModalVariant;
  buttons: ModalButtonConfig[];
  onAction: (action: "confirm" | "cancel") => void;
};

const variantConfirmStyles: Record<ModalVariant, string> = {
  info: "bg-amber-600 text-white hover:bg-amber-700",
  destructive: "bg-rose-600 text-white hover:bg-rose-700",
};

const confirmButtonIcon: Record<ModalVariant, string> = {
  info: "M5 13l4 4L19 7",
  destructive: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16",
};

export function Modal({ isOpen, title, message, variant = "info", buttons, onAction }: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const container = contentRef.current;
    const focusableEls = Array.from(
      container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
    );

    if (focusableEls.length === 0) return;

    const firstElement = focusableEls[0]!;
    const lastElement = focusableEls[focusableEls.length - 1]!;

    firstElement.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onAction("cancel");
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onAction]);

  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  const handleBackdropClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) {
        onAction("cancel");
      }
    },
    [onAction]
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          aria-hidden={!isOpen}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
          />

          {/* Content */}
          <motion.div
            ref={contentRef}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={title ? "modal-title" : undefined}
            aria-describedby="modal-message"
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header with colored accent bar */}
            <div
              className={`h-1.5 w-full ${variant === "destructive" ? "bg-rose-500" : "bg-amber-500"}`}
            />

            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    variant === "destructive"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {variant === "destructive" ? (
                      <>
                        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </>
                    ) : (
                      <>
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </>
                    )}
                  </svg>
                </div>

                <div className="flex-1">
                  {title ? (
                    <h3
                      id="modal-title"
                      className="text-base font-semibold text-slate-900"
                    >
                      {title}
                    </h3>
                  ) : null}
                  <p
                    id="modal-message"
                    className={`text-sm text-slate-600 ${title ? "mt-1" : ""}`}
                  >
                    {message}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex justify-end gap-3">
                {buttons.map((button) => {
                  const isConfirm = button.action === "confirm";
                  const baseClass =
                    isConfirm && button.variant === "primary"
                      ? variantConfirmStyles[variant]
                      : "bg-slate-100 text-slate-800 hover:bg-slate-200";

                  return (
                    <Button
                      key={button.action}
                      type="button"
                      variant="primary"
                      className={`${baseClass} ${isConfirm ? "gap-1.5" : ""}`}
                      onClick={() => onAction(button.action)}
                    >
                      {isConfirm && button.variant === "primary" ? (
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d={confirmButtonIcon[variant]} />
                        </svg>
                      ) : null}
                      {button.label}
                    </Button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
