import { useAuth } from '@/auth/AuthContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="max-w-3xl space-y-6 font-sans">
      <PageHeader title="System & User Configuration" description="Manage platform user identity credentials and enterprise system parameters." />

      <Card className="border-t-4 border-t-primary-500">
        <CardHeader title="USER ACCOUNT SPECIFICATION" subtitle="Authenticated user profile credentials" />
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-4 border-b border-carbon-gray-20 pb-4">
            <div className="flex h-10 w-10 items-center justify-center bg-carbon-gray-90 text-white font-mono font-bold text-sm">
              {user?.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm text-carbon-gray-100">{user?.name}</p>
              <p className="text-xs font-mono text-carbon-gray-60">{user?.email}</p>
            </div>
            <Badge tone="primary">{user?.role?.toUpperCase()}</Badge>
          </div>
          <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">System User ID</dt>
              <dd className="mt-0.5 font-mono font-semibold text-carbon-gray-100">{user?.id}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-bold uppercase tracking-wider text-carbon-gray-60">Assigned Privilege Role</dt>
              <dd className="mt-0.5 uppercase font-semibold text-carbon-gray-100">{user?.role}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="PLATFORM INFRASTRUCTURE" subtitle="System architecture specification" />
        <CardContent className="p-4 space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-carbon-gray-20 pb-2">
            <span className="font-bold uppercase tracking-wider text-carbon-gray-60">Design Framework</span>
            <span className="font-mono font-bold text-primary-500">IBM Carbon Enterprise Standard</span>
          </div>
          <div className="flex items-center justify-between border-b border-carbon-gray-20 pb-2">
            <span className="font-bold uppercase tracking-wider text-carbon-gray-60">ML Prediction Engine</span>
            <span className="font-mono text-carbon-gray-100">Scikit-Learn / XGBoost Inference</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-bold uppercase tracking-wider text-carbon-gray-60">Data Persistence Layer</span>
            <span className="font-mono text-carbon-gray-100">MongoDB BSON Indexing Engine</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}