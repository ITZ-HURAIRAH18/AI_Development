import { api } from './api'
import type { Appointment, Paginated } from '@/types'

export interface AppointmentFilters {
  search?: string
  clinic_id?: string
  doctor_id?: string
  risk?: string
  status?: string
  start_date?: string
  end_date?: string
  page?: number
  limit?: number
  sort_by?: string
  sort_order?: string
}

export const appointmentApi = {
  async list(filters: AppointmentFilters = {}) {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value !== '' && value !== null && value !== undefined),
    )
    const { data } = await api.get<{ data: Paginated<Appointment> }>('/api/appointments', {
      params,
    })
    return data.data
  },
  async get(id: string) {
    const { data } = await api.get<{ data: Appointment }>(`/api/appointments/${id}`)
    return data.data
  },
  async updateStatus(id: string, status: string) {
    const { data } = await api.put<{ data: Appointment }>(`/api/appointments/${id}/status`, { status })
    return data.data
  },
  async predict(id: string) {
    const { data } = await api.post<{ data: Record<string, unknown> }>(`/api/appointments/${id}/predict`)
    return data.data
  },
}