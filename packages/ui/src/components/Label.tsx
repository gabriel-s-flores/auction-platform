import type { LabelHTMLAttributes } from "react";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className = "", ...props }: LabelProps) {
  // eslint-disable-next-line jsx-a11y/label-has-associated-control
  return <label className={`mb-1 block text-sm font-medium text-slate-700 ${className}`} {...props} />;
}
