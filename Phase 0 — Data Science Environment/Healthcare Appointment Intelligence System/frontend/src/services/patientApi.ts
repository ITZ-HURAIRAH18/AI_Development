import { api } from './api'
import type { Paginated, Patient } from '@/types'

export const patientApi = {
  async list(params: { search?: string; page?: number; limit?: number; sort_by?: string; sort_order?: string } = {}) {
    const { data } = await api.get<{ data: Paginated<Patient> }>('/api/patients', { params })
    return data.data
  },
  async get(id: string) {
    const { data } = await api.get<{ data: Patient }>(`/api/patients/${id}`)
    return data.data
  },
}