import { type HTMLMotionProps, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { PropsWithChildren } from "react";

import { SPRING_SNAPPY, staggerItemCards } from "../utils/animation-utils";

export type CardProps = PropsWithChildren<
  HTMLMotionProps<"div"> & {
    /** Desativa a animação de hover lift (desativado por padrão globalmente) */
    disableHover?: boolean;
    /** Desativa a animação de entrada (stagger item) */
    disableEntrance?: boolean;
  }
>;

export function Card({
  children,
  className = "",
  disableHover = true,
  disableEntrance = false,
  ...props
}: CardProps) {
  const variants = disableEntrance ? undefined : (staggerItemCards as Variants);

  return (
    <motion.div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-xs ${className}`}
      variants={variants}
      initial={disableEntrance ? undefined : "hidden"}
      animate={disableEntrance ? undefined : "visible"}
      whileHover={
        disableHover
          ? undefined
          : {
              y: -2,
              boxShadow:
                "0 8px 25px -5px rgb(0 0 0 / 0.1), 0 4px 10px -6px rgb(0 0 0 / 0.1)",
              transition: SPRING_SNAPPY,
            }
      }
      {...props}
    >
      {children}
    </motion.div>
  );
}