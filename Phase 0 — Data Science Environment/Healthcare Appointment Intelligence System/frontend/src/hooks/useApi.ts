import { useCallback, useEffect, useState } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

const memoryCache = new Map<string, { timestamp: number; data: unknown }>()
const CACHE_TTL_MS = 30000 // 30-second cache

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], cacheKey?: string) {
  const [state, setState] = useState<State<T>>(() => {
    if (cacheKey && memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return { data: cached.data as T, loading: false, error: null }
      }
    }
    return { data: null, loading: true, error: null }
  })
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => {
    if (cacheKey) {
      memoryCache.delete(cacheKey)
    }
    setReloadKey((k) => k + 1)
  }, [cacheKey])

  useEffect(() => {
    let active = true

    if (cacheKey && memoryCache.has(cacheKey)) {
      const cached = memoryCache.get(cacheKey)!
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setState({ data: cached.data as T, loading: false, error: null })
        return
      }
    }

    setState((prev) => ({ ...prev, loading: prev.data === null, error: null }))
    fetcher()
      .then((data) => {
        if (active) {
          if (cacheKey) {
            memoryCache.set(cacheKey, { timestamp: Date.now(), data })
          }
          setState({ data, loading: false, error: null })
        }
      })
      .catch((err: unknown) => {
        if (active) setState((prev) => ({ ...prev, loading: false, error: extractMessage(err) }))
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadKey])

  return { ...state, reload }
}

export function extractMessage(error: unknown): string {
  const axiosError = error as { response?: { data?: { message?: string } } }
  return axiosError?.response?.data?.message ?? 'Unable to load data.'
}