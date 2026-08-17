import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Settings" description="Manage your account and profile." />

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-700">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold text-charcoal">{user?.name}</p>
              <p className="text-sm text-charcoal-muted">{user?.email}</p>
            </div>
            <Badge tone="primary">{user?.role}</Badge>
          </div>
          <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs text-charcoal-muted">User ID</dt>
              <dd className="mt-0.5 font-mono text-xs text-charcoal">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-charcoal-muted">Role</dt>
              <dd className="mt-0.5 capitalize text-charcoal">{user?.role}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}