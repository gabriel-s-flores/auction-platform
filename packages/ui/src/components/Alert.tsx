import { AnimatePresence, type HTMLMotionProps,motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { fadeSlideUp } from "../utils/animation-utils";

type AlertVariant = "info" | "success" | "error";

export type AlertProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    variant?: AlertVariant;
    /** Controla visibilidade com animação de saída */
    visible?: boolean;
  }
>;

const variantStyles: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900"
};

export function Alert({ children, className = "", variant = "info", visible = true, ...props }: AlertProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`rounded-lg border px-3 py-2 text-sm ${variantStyles[variant]} ${className}`}
          variants={fadeSlideUp}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="alert"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}