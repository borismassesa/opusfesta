'use client'

import { useEffect } from 'react'

type MinimalClerk = {
  loaded?: boolean
  status?: string
  load?: () => Promise<unknown>
}

/**
 * Production safety net for a clerk-js auto-init regression.
 *
 * On opuspass.opusfesta.com the bundled `@clerk` React SDK never auto-calls
 * `Clerk.load()` against the *production* Frontend API, so clerk-js sticks at
 * `status:"loading"`, `useUser().isLoaded` never flips true, and the auth UI
 * (navbar Log in / Sign up, dashboard button, UserButton) never renders.
 *
 * clerk-js itself is healthy — invoking `Clerk.load()` resolves it to `ready`.
 * So this polls and nudges `load()` until Clerk reports loaded.
 *
 * Robustness matters: `window.Clerk` can attach LATE (cold CDN), well after
 * mount, and its `status` is not reliably `"loading"` at the moment we look. So
 * we poll for a generous window and nudge whenever Clerk exists and isn't
 * loaded yet — regardless of `status`. clerk-js de-dupes concurrent `load()`
 * calls, so re-nudging is safe. Stops as soon as `loaded` is true.
 *
 * Does NOT reproduce locally/on dev instances (different init path), so this
 * stays until the SDK is upgraded to a version that auto-inits on production.
 */
export default function ClerkLoadFallback() {
  useEffect(() => {
    let stopped = false
    let elapsed = 0
    const STEP = 400
    const MAX = 40000 // keep trying for up to 40s; covers slow/cold clerk-js loads

    const tick = () => {
      if (stopped) return
      const clerk = (window as unknown as { Clerk?: MinimalClerk }).Clerk
      if (clerk?.loaded) return // success — clerk is up, nothing more to do
      if (clerk && typeof clerk.load === 'function') {
        // Nudge regardless of `status` — clerk-js guards re-entrancy.
        clerk.load().catch(() => {})
      }
      elapsed += STEP
      if (elapsed < MAX) setTimeout(tick, STEP)
    }

    // Small initial delay so clerk-js has a chance to attach `window.Clerk`.
    const startId = setTimeout(tick, 250)
    return () => {
      stopped = true
      clearTimeout(startId)
    }
  }, [])

  return null
}
