import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 bg-background px-6 py-24">
      <p className="text-6xl font-semibold tracking-tight text-carbon-gray-90">404</p>
      <h1 className="text-xl font-semibold text-carbon-gray-100">Page not found</h1>
      <p className="text-sm text-carbon-gray-60">The page you are looking for does not exist or has been moved.</p>
      <Link to="/">
        <Button variant="primary" size="sm">Back to dashboard</Button>
      </Link>
    </div>
  )
}