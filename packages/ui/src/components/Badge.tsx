import type { HTMLAttributes, PropsWithChildren } from "react";

type BadgeVariant = "neutral" | "success" | "danger";

export type BadgeProps = PropsWithChildren<
  HTMLAttributes<HTMLSpanElement> & {
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
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
}
