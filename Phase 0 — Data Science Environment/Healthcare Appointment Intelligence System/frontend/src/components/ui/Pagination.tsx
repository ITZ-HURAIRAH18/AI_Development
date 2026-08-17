export function Pagination({
  page,
  total,
  limit,
  onPageChange,
}: {
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit))
  if (totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-border px-4 py-3" aria-label="Pagination">
      <p className="text-sm text-charcoal-muted">
        Showing <span className="font-medium text-charcoal">{Math.min((page - 1) * limit + 1, total)}</span>–
        <span className="font-medium text-charcoal">{Math.min(page * limit, total)}</span> of{' '}
        <span className="font-medium text-charcoal">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-md border border-border bg-white px-3 py-1 text-sm text-charcoal hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="px-2 text-sm text-charcoal-muted">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-md border border-border bg-white px-3 py-1 text-sm text-charcoal hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </nav>
  )
}