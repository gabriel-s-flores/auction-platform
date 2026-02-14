import type { HTMLAttributes, PropsWithChildren } from "react";

type AlertVariant = "info" | "success" | "error";

export type AlertProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    variant?: AlertVariant;
  }
>;

const variantStyles: Record<AlertVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900",
  error: "border-rose-200 bg-rose-50 text-rose-900"
};

export function Alert({ children, className = "", variant = "info", ...props }: AlertProps) {
  return (
    <div className={`rounded-lg border px-3 py-2 text-sm ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
