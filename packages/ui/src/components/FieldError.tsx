export type FieldErrorProps = {
  children?: string | null;
  id?: string;
  className?: string;
};

export function FieldError({ children, id, className = "" }: FieldErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p
      id={id}
      role="alert"
      className={`mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600 ${className}`}
    >
      <span aria-hidden="true" className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-[10px] leading-none">
        !
      </span>
      <span>{children}</span>
    </p>
  );
}
