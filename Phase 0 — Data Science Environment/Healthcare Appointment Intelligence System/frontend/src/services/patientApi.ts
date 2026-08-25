import { api } from './api'
import type { Paginated, Patient } from '@/types'

export const patientApi = {
  async list(params: { search?: string; clinic_id?: string; page?: number; limit?: number; sort_by?: string; sort_order?: string } = {}) {
    const { data } = await api.get<{ data: Paginated<Patient> }>('/api/patients', { params })
    return data.data
  },
  async get(id: string) {
    const { data } = await api.get<{ data: Patient }>(`/api/patients/${id}`)
    return data.data
  },
  async create(payload: Record<string, unknown>) {
    const { data } = await api.post<{ data: Patient }>('/api/patients', payload)
    return data.data
  },
  async update(id: string, payload: Record<string, unknown>) {
    const { data } = await api.put<{ data: Patient }>(`/api/patients/${id}`, payload)
    return data.data
  },
  async delete(id: string) {
    const { data } = await api.delete<{ data: Record<string, unknown> }>(`/api/patients/${id}`)
    return data.data
  },
}