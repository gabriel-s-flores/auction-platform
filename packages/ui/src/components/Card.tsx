import { type HTMLMotionProps,motion } from "framer-motion";
import type { PropsWithChildren } from "react";

import { SPRING_SNAPPY } from "../utils/animation-utils";

export type CardProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    /** Desativa a animação de hover lift */
    disableHover?: boolean;
  }
>;

export function Card({ children, className = "", disableHover = false, ...props }: CardProps) {
  return (
    <motion.div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-xs ${className}`}
      whileHover={
        disableHover
          ? undefined
          : { y: -2, boxShadow: "0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -6px rgb(0 0 0 / 0.1)", transition: SPRING_SNAPPY }
      }
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}