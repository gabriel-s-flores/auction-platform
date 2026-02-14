import type { HTMLAttributes, PropsWithChildren } from "react";

export type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className = "", ...props }: CardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className}`} {...props}>
      {children}
    </div>
  );
}
