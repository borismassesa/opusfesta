'use client'

import { useEffect } from 'react'

type MinimalClerk = {
  loaded?: boolean
  status?: string
  load?: () => Promise<unknown>
}

/**
 * Production-only safety net for a clerk-js auto-init regression.
 *
 * On opuspass.opusfesta.com the bundled `@clerk/shared` script-loader fails to
 * call `Clerk.load()` against the *production* Frontend API, so clerk-js sticks
 * at `status: "loading"`, `useUser().isLoaded` never flips true, and the auth UI
 * (navbar Log in / Sign up, dashboard button, UserButton) never renders.
 *
 * clerk-js itself is fine — invoking `Clerk.load()` manually resolves it to
 * `ready` — so this nudges it if it's still stuck shortly after mount. It is a
 * no-op once Clerk is loaded (the normal case, incl. all local/dev builds), and
 * stops after a bounded number of attempts so it can never spin.
 *
 * Remove once opus_pass is realigned to the `@clerk/*` versions that auto-init
 * correctly (see opus_website, which loads the same clerk-js 6.20.0 cleanly).
 */
export default function ClerkLoadFallback() {
  useEffect(() => {
    let attempts = 0
    const id = setInterval(() => {
      const clerk = (window as unknown as { Clerk?: MinimalClerk }).Clerk
      // Loaded (or gone) — nothing to do.
      if (!clerk || clerk.loaded) {
        clearInterval(id)
        return
      }
      // Stuck mid-load: ask clerk-js to complete initialization.
      if (clerk.status === 'loading' && typeof clerk.load === 'function') {
        clerk.load().catch(() => {})
      }
      if (++attempts >= 12) clearInterval(id)
    }, 400)
    return () => clearInterval(id)
  }, [])

  return null
}
