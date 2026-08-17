import { useCallback, useEffect, useState } from 'react'

interface State<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []) {
  const [state, setState] = useState<State<T>>({ data: null, loading: true, error: null })
  const [reloadKey, setReloadKey] = useState(0)

  const reload = useCallback(() => setReloadKey((k) => k + 1), [])

  useEffect(() => {
    let active = true
    setState((prev) => ({ ...prev, loading: true, error: null }))
    fetcher()
      .then((data) => {
        if (active) setState({ data, loading: false, error: null })
      })
      .catch((err: unknown) => {
        if (active) setState({ data: null, loading: false, error: extractMessage(err) })
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