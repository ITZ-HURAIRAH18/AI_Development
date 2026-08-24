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
    <Card className="h-full">
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className="p-4">{children}</div>
    </Card>
  )
}