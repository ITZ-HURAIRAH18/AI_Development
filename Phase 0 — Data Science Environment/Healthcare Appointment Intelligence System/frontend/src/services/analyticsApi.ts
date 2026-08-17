import { api } from './api'
import type {
  DashboardCharts,
  DashboardData,
  UtilizationRow,
  WaitingTimeAnalytics,
} from '@/types'

export const analyticsApi = {
  async dashboard(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: DashboardData }>('/api/analytics/dashboard', { params })
    return data.data
  },
  async charts(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: DashboardCharts }>('/api/analytics/charts', { params })
    return data.data
  },
  async utilization(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: UtilizationRow[] }>('/api/analytics/clinic-utilization', { params })
    return data.data
  },
  async waitingTime(params: { clinic_id?: string; doctor_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: WaitingTimeAnalytics }>('/api/analytics/waiting-time', { params })
    return data.data
  },
  async schedulingRisk(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: unknown }>('/api/analytics/scheduling-risk', { params })
    return data.data
  },
  async advanced(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: unknown }>('/api/analytics/advanced', { params })
    return data.data
  },
}