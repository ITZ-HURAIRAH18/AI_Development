import { api } from './api'
import type { TokenResponse, User } from '@/types'

export const authApi = {
  async register(payload: { name: string; email: string; password: string; role?: string }) {
    const { data } = await api.post<{ data: TokenResponse }>('/api/auth/register', payload)
    return data.data
  },
  async login(payload: { email: string; password: string }) {
    const { data } = await api.post<{ data: TokenResponse }>('/api/auth/login', payload)
    return data.data
  },
  async me() {
    const { data } = await api.get<{ data: User }>('/api/auth/me')
    return data.data
  },
  async logout() {
    await api.post('/api/auth/logout')
  },
}