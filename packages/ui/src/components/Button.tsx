import { type HTMLMotionProps,motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { SPRING_SNAPPY } from "../utils/animation-utils";

type ButtonVariant = "primary" | "secondary";

export type ButtonProps = PropsWithChildren<
  HTMLMotionProps<"button"> & {
    variant?: ButtonVariant;
  }
>;

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-amber-600 text-white hover:bg-amber-700",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200"
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <motion.button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition ${variantStyles[variant]} ${className}`}
      whileHover={{ scale: 1.02, transition: SPRING_SNAPPY }}
      whileTap={{ scale: 0.96, transition: SPRING_SNAPPY }}
      {...props}
    >
      {children}
    </motion.button>
  );
}