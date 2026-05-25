'use client'

import { useState, useCallback, useEffect } from 'react'
import { apiClient } from './api-client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export function useApi<T>(
  endpoint: string,
  options?: { skip?: boolean }
): UseApiState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  const fetch = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }))
      const response = await apiClient.get(endpoint)
      setState({
        data: (response.data || response.blogs || response.blog || response) as T,
        loading: false,
        error: null,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      setState({
        data: null,
        loading: false,
        error: message,
      })
    }
  }, [endpoint])

  useEffect(() => {
    if (!options?.skip) {
      fetch()
    }
  }, [fetch, options?.skip])

  return { ...state, refetch: fetch }
}

export function useMutation<T>(
  fn: (...args: any[]) => Promise<any>
): {
  execute: (...args: any[]) => Promise<T>
  loading: boolean
  error: string | null
  data: T | null
} {
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    data: T | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      try {
        setState({ loading: true, error: null, data: null })
        const response = await fn(...args)
        setState({
          loading: false,
          error: null,
          data: response as T,
        })
        return response as T
      } catch (error) {
        const message = error instanceof Error ? error.message : 'An error occurred'
        setState({
          loading: false,
          error: message,
          data: null,
        })
        throw error
      }
    },
    [fn]
  )

  return {
    execute,
    loading: state.loading,
    error: state.error as string | null,
    data: state.data as T | null,
  }
}
