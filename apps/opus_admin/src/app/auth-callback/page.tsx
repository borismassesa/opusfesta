'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

// After Clerk's <SignIn /> / <SignUp /> complete they do a client-side
// router.push(). That soft navigation reaches the server before Clerk's
// __session cookie is established, so auth() returns null and the admin
// layout redirects to /contribute which also sees no session — blank page.
//
// This page acts as a relay: Clerk navigates here (client-side), then we
// do a full browser navigation (window.location.replace) which forces a
// fresh HTTP request. By then the session cookie is set and the server
// reads auth() correctly.

export default function AuthCallbackPage() {
  const searchParams = useSearchParams()
  const next = searchParams.get('next')
  const dest =
    next && next.startsWith('/') && !next.startsWith('//')
      ? next
      : '/'

  useEffect(() => {
    window.location.replace(dest)
  }, [dest])

  return null
}
