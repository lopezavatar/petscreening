"use client";

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
}: PaginationProps) {
  // BUG: Off-by-one error - should be Math.ceil(totalItems / itemsPerPage)
  // This will show one fewer page when totalItems is exactly divisible by itemsPerPage
  const totalPages = Math.floor(totalItems / itemsPerPage) + (totalItems % itemsPerPage > 0 ? 1 : 0);

  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];

  // Build page numbers with ellipsis
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    // Always show first page
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    // Show pages around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1">
      {/* Previous button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: currentPage === 1 ? "transparent" : "var(--bg-subtle)",
          color: currentPage === 1 ? "var(--fg-subtle)" : "var(--fg)",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          border: "1px solid var(--border)",
        }}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M10 4 L6 8 L10 12" />
        </svg>
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-sm"
            style={{ color: "var(--fg-subtle)" }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors"
            style={{
              background: page === currentPage ? "var(--brand)" : "var(--bg-subtle)",
              color: page === currentPage ? "var(--action-fg)" : "var(--fg)",
              border: page === currentPage ? "none" : "1px solid var(--border)",
              cursor: "pointer",
            }}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      {/* Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-9 h-9 flex items-center justify-center rounded-lg transition-colors"
        style={{
          background: currentPage === totalPages ? "transparent" : "var(--bg-subtle)",
          color: currentPage === totalPages ? "var(--fg-subtle)" : "var(--fg)",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          border: "1px solid var(--border)",
        }}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 4 L10 8 L6 12" />
        </svg>
      </button>
    </div>
  );
}
