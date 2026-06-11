'use client'

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs'

// Landing route for headless OAuth (Google). Clerk redirects the
// provider hand-off back here; this component finishes the transfer and then
// sends new vendors to /onboard and returning vendors to /dashboard.
export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#C9A0DC]"
        role="status"
        aria-label="Finishing sign-in"
      />
      <AuthenticateWithRedirectCallback
        signUpForceRedirectUrl="/onboard"
        signInForceRedirectUrl="/dashboard"
      />
    </div>
  )
}
