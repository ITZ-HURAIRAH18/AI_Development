import { api } from './api'

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'doctor' | 'staff'
  created_at?: string
}

export interface CreateUserRequest {
  name: string
  email: string
  password: string
  role: string
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  role?: string
}

export const usersApi = {
  async listUsers() {
    const response = await api.get<{ data: User[] }>('/users')
    return response.data.data
  },

  async getUser(id: string) {
    const response = await api.get<{ data: User }>(`/users/${id}`)
    return response.data.data
  },

  async createUser(data: CreateUserRequest) {
    const response = await api.post<{ data: User }>('/users', data)
    return response.data.data
  },

  async updateUser(id: string, data: UpdateUserRequest) {
    const response = await api.put<{ data: User }>(`/users/${id}`, data)
    return response.data.data
  },

  async deleteUser(id: string) {
    await api.delete(`/users/${id}`)
  },
}
