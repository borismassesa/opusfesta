'use client'

import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query from React. Uses useSyncExternalStore so the
 * server render and the first client render agree (both take the SSR default),
 * then React re-renders once with the real match on mount — no hydration
 * mismatch, at the cost of a brief first-paint flash to the default.
 *
 * `ssrDefault` is what the query is assumed to be before the browser can
 * answer. Pass the value that avoids double-mounting the more expensive branch.
 */
export function useMediaQuery(query: string, ssrDefault = false): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    () => window.matchMedia(query).matches,
    () => ssrDefault,
  )
}

/** Tailwind's `lg` breakpoint, the dashboard's mobile/desktop divide. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
