import { api } from './api'
import type { Clinic, UtilizationRow } from '@/types'

export const clinicApi = {
  async list() {
    const { data } = await api.get<{ data: Clinic[] }>('/api/clinics')
    return data.data
  },
  async get(id: string) {
    const { data } = await api.get<{ data: Clinic }>(`/api/clinics/${id}`)
    return data.data
  },
  async utilization(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: UtilizationRow[] }>('/api/analytics/clinic-utilization', { params })
    return data.data
  },
}