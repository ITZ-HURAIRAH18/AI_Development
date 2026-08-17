import { api } from './api'
import type { FullPredictionResult, NoShowResult, Paginated, Prediction, WaitingTimeResult } from '@/types'

export interface NoShowPayload {
  age: number
  gender: string
  scholarship: number
  hypertension: number
  diabetes: number
  alcoholism: number
  handicap: number
  sms_received: number
  scheduled_day: string
  appointment_day: string
}

export interface OperationalPayload {
  queue_length: number
  patients_ahead: number
  consultation_duration: number
  doctor_load: number
  room_available: number
}

export const predictionApi = {
  async noShow(payload: NoShowPayload) {
    const { data } = await api.post<{ data: NoShowResult }>('/api/predictions/no-show', payload)
    return data.data
  },
  async waitingTime(payload: OperationalPayload) {
    const { data } = await api.post<{ data: WaitingTimeResult }>('/api/predictions/waiting-time', payload)
    return data.data
  },
  async full(payload: { no_show: NoShowPayload; operational: OperationalPayload; appointment_id?: string }) {
    const { data } = await api.post<{ data: FullPredictionResult }>('/api/predictions/full', payload)
    return data.data
  },
  async history(params: { page?: number; limit?: number } = {}) {
    const { data } = await api.get<{ data: Paginated<Prediction> }>('/api/predictions', { params })
    return data.data
  },
}