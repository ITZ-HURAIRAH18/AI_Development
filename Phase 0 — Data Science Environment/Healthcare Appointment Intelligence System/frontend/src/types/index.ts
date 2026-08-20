export type Role = 'admin' | 'doctor' | 'staff'

export interface User {
  id: string
  name: string
  email: string
  role: Role | string
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
  user: User
}

export interface NoShowResult {
  probability: number
  risk: string
}

export interface WaitingTimeResult {
  expected_waiting_time: number
}

export interface FullPredictionResult {
  no_show_probability: number
  no_show_risk: string
  expected_waiting_time: number
  scheduling_risk: string
  risk_score: number
  risk_factors: string[]
}

export interface Appointment {
  id: string
  appointment_id: string
  patient_id: string
  doctor_id: string
  clinic_id: string
  scheduled_day: string
  appointment_day: string
  status: string
  sms_received: number
  queue_length: number
  patients_ahead: number
  consultation_duration: number
  doctor_load: number
  room_available: number
  waiting_time: number | null
  no_show_probability?: number | null
  no_show_risk?: string
  scheduling_risk?: string
  risk_score?: number
  risk_factors?: string[]
  patient?: Patient
  doctor?: Doctor
  clinic?: Clinic
  prediction?: Prediction | null
}

export interface Patient {
  id: string
  patient_id: string
  name: string
  age: number
  gender: string
  neighbourhood?: string
  created_at?: string
  appointments?: number
  no_show_rate?: number
  last_appointment?: string | null
  risk_status?: string
  history?: Appointment[]
}

export interface Doctor {
  id?: string
  doctor_id: string
  name: string
  clinic_id: string
  specialization: string
  active?: boolean
  appointments?: number
  average_waiting_time?: number
  doctor_load?: number
  no_show_rate?: number
  utilization?: number
  clinic_name?: string
  trends?: Array<{
    _id: { day: string }
    appointments: number
    average_waiting_time: number
    average_doctor_load: number
  }>
}

export interface Clinic {
  id: string
  clinic_id: string
  name: string
  location: string
  doctors?: number | Doctor[]
  appointments?: number
  utilization?: number
  average_waiting_time?: number
  no_show_rate?: number
  average_doctor_load?: number
  total_consultation_minutes?: number
  risk_distribution?: { LOW: number; MEDIUM: number; HIGH: number }
}

export interface Prediction {
  id: string
  appointment_id: string | null
  no_show_probability: number
  no_show_risk: string
  expected_waiting_time: number
  scheduling_risk: string
  risk_score: number
  risk_factors: string[]
  created_at: string
}

export interface Paginated<T> {
  items: T[]
  total: number
  page: number
  limit: number
}

export interface DashboardData {
  total_appointments: number
  predicted_no_shows: number
  average_waiting_time: number
  average_doctor_load: number
  high_risk_appointments: number
  clinic_utilization: number
}

export interface UtilizationRow {
  clinic_id: string
  doctors_count: number
  patient_volume: number
  total_consultation_minutes: number
  average_waiting_time: number
  average_doctor_load: number
  no_show_rate: number
  utilization_percentage: number
}

export interface TimeSeriesPoint {
  date: string
  [key: string]: string | number
}

export interface DashboardCharts {
  appointment_volume: TimeSeriesPoint[]
  no_show_rate: TimeSeriesPoint[]
  waiting_time_trend: TimeSeriesPoint[]
  clinic_utilization: UtilizationRow[]
  doctor_workload: Array<Record<string, number | string>>
  scheduling_risk_distribution: Array<{ _id: string; count: number }>
}

export interface WaitingTimeAnalytics {
  stats: { average: number; median: number; maximum: number; count: number }
  distribution: Array<{ _id: string; count: number }>
  by_clinic: Array<{ clinic_id: string; average: number }>
  by_doctor: Array<{ doctor_id: string; average: number }>
  trend: TimeSeriesPoint[]
}