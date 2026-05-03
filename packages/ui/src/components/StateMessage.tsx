import type { ReactNode } from "react";

type StateMessageVariant = "default" | "error";

export type StateMessageProps = {
  children: ReactNode;
  className?: string;
  variant?: StateMessageVariant;
};

const variantStyles: Record<StateMessageVariant, string> = {
  default: "text-slate-500",
  error: "text-rose-700",
};

export function StateMessage({
  children,
  className = "",
  variant = "default",
}: StateMessageProps) {
  return (
    <p className={`py-6 text-center text-sm ${variantStyles[variant]} ${className}`}>
      {children}
    </p>
  );
}
