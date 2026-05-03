import { Button } from "./Button";

export type PaginationProps = {
  className?: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
};

export function Pagination({
  className = "",
  currentPage,
  onPageChange,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav
      aria-label="Paginação"
      className={`mt-6 flex justify-center gap-2 ${className}`}
    >
      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        type="button"
      >
        Anterior
      </Button>

      <span className="px-4 py-2 text-sm text-slate-600">
        Página {currentPage} de {totalPages}
      </span>

      <Button
        variant="secondary"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        type="button"
      >
        Próxima
      </Button>
    </nav>
  );
}
