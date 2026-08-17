export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return Math.round(value).toLocaleString('en-US')
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)}%`
}

export function formatMinutes(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value)} min`
}

export function formatProbability(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—'
  return `${Math.round(value * 100)}%`
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return value.slice(0, 10)
}