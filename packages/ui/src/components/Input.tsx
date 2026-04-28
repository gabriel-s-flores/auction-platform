import { type HTMLMotionProps,motion } from "framer-motion";
import { useState } from "react";

import { SPRING_SNAPPY } from "../utils/animation-utils";

export type InputProps = HTMLMotionProps<"input"> & {
  /** Quando true, aplica shake animation (útil para erros de validação) */
  shake?: boolean;
};

export function Input({ className = "", shake = false, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <motion.input
      className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-hidden transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 ${
        isFocused
          ? "border-amber-500 ring-2 ring-amber-100"
          : "border-slate-300"
      } ${className}`}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      animate={
        shake
          ? { x: [0, -6, 6, -4, 4, -2, 2, 0] }
          : { x: 0 }
      }
      transition={
        shake
          ? { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
          : SPRING_SNAPPY
      }
      whileFocus={{ scale: 1.005, transition: SPRING_SNAPPY }}
      {...props}
    />
  );
}