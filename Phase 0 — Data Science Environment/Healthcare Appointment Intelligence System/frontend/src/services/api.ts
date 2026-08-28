import axios, { AxiosError, AxiosInstance } from 'axios'

const TOKEN_KEY = 'healthcare_intelligence_token'

export const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://ai-development-coral.vercel.app',
  headers: { 'Content-Type': 'application/json' },
})

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function storeToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY)
}

api.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearStoredToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/** Extract a human-readable error message. */
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined
    if (data?.message) return data.message
    if (error.code === 'ERR_NETWORK') {
      return 'Unable to reach the server. Please check that the backend is running.'
    }
    return error.message
  }
  return 'An unexpected error occurred.'
}