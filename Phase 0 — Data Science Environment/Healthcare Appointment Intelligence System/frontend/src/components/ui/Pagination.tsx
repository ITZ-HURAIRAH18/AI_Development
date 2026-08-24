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
    <nav className="flex items-center justify-between gap-4 border border-t-0 border-carbon-gray-20 bg-carbon-gray-10 px-4 py-2.5 font-sans" aria-label="Pagination">
      <p className="text-xs text-carbon-gray-70">
        Showing <span className="font-semibold text-carbon-gray-100">{Math.min((page - 1) * limit + 1, total)}</span>–
        <span className="font-semibold text-carbon-gray-100">{Math.min(page * limit, total)}</span> of{' '}
        <span className="font-semibold text-carbon-gray-100">{total}</span> records
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-none border border-carbon-gray-30 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-carbon-gray-100 hover:bg-carbon-gray-20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <span className="px-2 text-xs font-mono text-carbon-gray-70">
          Page {page} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-none border border-carbon-gray-30 bg-surface px-3 py-1 text-xs font-semibold uppercase tracking-wider text-carbon-gray-100 hover:bg-carbon-gray-20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </nav>
  )
}