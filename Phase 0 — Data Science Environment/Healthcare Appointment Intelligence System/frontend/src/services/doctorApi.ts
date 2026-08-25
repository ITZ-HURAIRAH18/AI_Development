import { api } from './api'
import type { Doctor } from '@/types'

export const doctorApi = {
  async list(params: { search?: string; clinic_id?: string } = {}) {
    const { data } = await api.get<{ data: Doctor[] }>('/api/doctors', { params })
    return data.data
  },
  async get(id: string) {
    const { data } = await api.get<{ data: Doctor }>(`/api/doctors/${id}`)
    return data.data
  },
  async workload(params: { clinic_id?: string; start?: string; end?: string } = {}) {
    const { data } = await api.get<{ data: Array<Record<string, number | string>> }>('/api/analytics/doctor-workload', { params })
    return data.data
  },
  async create(payload: Record<string, unknown>) {
    const { data } = await api.post<{ data: Doctor }>('/api/doctors', payload)
    return data.data
  },
}