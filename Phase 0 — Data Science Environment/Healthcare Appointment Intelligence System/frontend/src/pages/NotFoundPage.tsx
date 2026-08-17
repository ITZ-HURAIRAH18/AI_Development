import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <p className="text-5xl font-semibold text-primary-700">404</p>
      <h1 className="text-xl font-semibold text-charcoal">Page not found</h1>
      <p className="text-sm text-charcoal-muted">The page you are looking for does not exist.</p>
      <Link to="/" className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800">
        Back to dashboard
      </Link>
    </div>
  )
}