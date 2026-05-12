'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'

export type BookingActionState = {
  loading: boolean
  error: string | null
}

export type BookingAction = BookingActionState & {
  perform: (
    fn: () => Promise<Response>,
    options?: { successMessage?: string; errorMessage?: string },
  ) => Promise<boolean>
  clear: () => void
}

/**
 * Thin hook for async booking PATCH / POST calls.
 * Returns loading + error state and a `perform` wrapper.
 * `perform` returns `true` on success, `false` on failure.
 */
export function useBookingAction(): BookingAction {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const perform = useCallback(async (
    fn: () => Promise<Response>,
    options?: { successMessage?: string; errorMessage?: string },
  ): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fn()
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const fallback = `Request failed (${res.status})`
        const msg = (body as { error?: string }).error ?? fallback
        setError(msg)
        toast.error(options?.errorMessage ?? msg)
        return false
      }
      if (options?.successMessage) {
        toast.success(options.successMessage)
      }
      return true
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'An unexpected error occurred'
      setError(msg)
      toast.error(options?.errorMessage ?? msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => setError(null), [])

  return { loading, error, perform, clear }
}
