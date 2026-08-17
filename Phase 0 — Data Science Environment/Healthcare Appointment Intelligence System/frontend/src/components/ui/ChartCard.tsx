import type { ReactNode } from 'react'
import { Card, CardHeader } from '@/components/ui/Card'

interface ChartCardProps {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

export function ChartCard({ title, subtitle, action, children }: ChartCardProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className="px-5 py-4">{children}</div>
    </Card>
  )
}