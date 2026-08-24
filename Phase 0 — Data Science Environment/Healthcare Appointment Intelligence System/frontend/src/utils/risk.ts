export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export interface RiskStyle {
  badge: string
  dot: string
  label: string
}

export function getRiskStyle(level: RiskLevel | string): RiskStyle {
  switch (level) {
    case 'HIGH':
      return {
        badge: 'bg-danger/10 text-danger border border-danger/20',
        dot: 'bg-danger',
        label: 'High Risk',
      }
    case 'MEDIUM':
      return {
        badge: 'bg-warning/10 text-warning border border-warning/20',
        dot: 'bg-warning',
        label: 'Medium Risk',
      }
    default:
      return {
        badge: 'bg-success/10 text-success border border-success/20',
        dot: 'bg-success',
        label: 'Low Risk',
      }
  }
}

export function riskFromProbability(probability: number | null | undefined): RiskLevel {
  if (probability === null || probability === undefined) return 'LOW'
  if (probability >= 0.7) return 'HIGH'
  if (probability >= 0.4) return 'MEDIUM'
  return 'LOW'
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#198038',
  MEDIUM: '#B28600',
  HIGH: '#DA1E28',
}