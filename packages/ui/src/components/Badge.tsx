import { type HTMLMotionProps,motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { popIn } from "../utils/animation-utils";

type BadgeVariant = "neutral" | "success" | "danger";

export type BadgeProps = PropsWithChildren<
  HTMLMotionProps<"span"> & {
    variant?: BadgeVariant;
  }
>;

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  danger: "bg-rose-100 text-rose-700"
};

export function Badge({ children, className = "", variant = "neutral", ...props }: BadgeProps) {
  return (
    <motion.span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
      variants={popIn}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {children}
    </motion.span>
  );
}