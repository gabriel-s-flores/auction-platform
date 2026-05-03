import type { PropsWithChildren, ReactNode } from "react";

import { FieldError } from "./FieldError";
import { Label } from "./Label";

export type FormFieldProps = PropsWithChildren<{
  className?: string;
  error?: string | null;
  errorId?: string;
  hint?: ReactNode;
  id: string;
  label: ReactNode;
}>;

export function FormField({
  children,
  className = "",
  error,
  errorId,
  hint,
  id,
  label,
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-2 text-sm font-medium text-slate-700 ${className}`}>
      <Label className="mb-0" htmlFor={id}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs font-normal text-slate-500">{hint}</p> : null}
      <FieldError id={errorId} className="mt-0">
        {error}
      </FieldError>
    </div>
  );
}
