import React from "react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 12,
  itemName = "auctions",
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= pageSize)) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems ?? currentPage * pageSize);

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-4 border-t border-outline-variant/30 ${className}`}>
      {totalItems !== undefined && (
        <p className="text-xs text-on-surface-variant font-medium">
          Showing <span className="font-bold text-on-surface">{totalItems === 0 ? 0 : startItem}</span>–
          <span className="font-bold text-on-surface">{endItem}</span> of{" "}
          <span className="font-bold text-on-surface">{totalItems}</span> {itemName}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 self-center sm:self-auto">
          {/* Previous button */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-all bg-white shadow-2xs cursor-pointer"
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-sm">chevron_left</span>
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Page numbers */}
          <div className="flex items-center gap-1">
            {pages.map((p, idx) =>
              p === "..." ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-xs text-outline font-bold">
                  ...
                </span>
              ) : (
                <button
                  key={`page-${p}`}
                  type="button"
                  onClick={() => onPageChange(p)}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    currentPage === p
                      ? "bg-primary text-white shadow-xs"
                      : "bg-white border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary"
                  }`}
                  aria-current={currentPage === p ? "page" : undefined}
                >
                  {p}
                </button>
              )
            )}
          </div>

          {/* Next button */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl border border-outline-variant/40 text-on-surface-variant hover:border-primary hover:text-primary disabled:opacity-40 disabled:pointer-events-none transition-all bg-white shadow-2xs cursor-pointer"
            aria-label="Next page"
          >
            <span className="hidden sm:inline">Next</span>
            <span className="material-symbols-outlined text-sm">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
