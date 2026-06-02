'use client'

import { useEffect, useState } from 'react'
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'

// Clerk loads its UI from its frontend-API host (derived from the publishable
// key). If that host can't be reached — e.g. a custom domain whose DNS isn't
// set up — clerk-js never initialises, <ClerkLoaded> never mounts, and the
// page is blank. This wrapper shows a spinner while loading and, after a grace
// period, a clear "unavailable" message with a retry instead of a dead page.
//
// Trade-off: <SignIn> renders inside <ClerkLoaded>, so it no longer SSRs — a
// reachable Clerk shows the spinner for its init time (~200–600ms) before the
// form. Acceptable for a low-traffic admin login, and the win (no blank page on
// failure) outweighs it. The "stalled" message only paints while <ClerkLoading>
// is still mounted, so once Clerk loads it disappears regardless of the timer;
// the 15s threshold is deliberately well beyond a slow-mobile cold load so the
// message reflects a genuine failure, not just a slow-but-successful init.
const STALL_THRESHOLD_MS = 15000

// Decorative left-panel image. Plain <img> (not next/image) so it needs no
// remotePatterns config; it's behind a gradient and marked alt="" (decorative).
const SIDE_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80'

export default function SignInClient({ redirectUrl }: { redirectUrl?: string }) {
  const [stalled, setStalled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — brand image panel (hidden on small screens, form takes over) */}
      <div className="relative hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SIDE_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-10 xl:p-14">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">OpusFesta</p>
          <h2 className="mt-3 max-w-md text-3xl font-bold leading-tight text-white">Admin console</h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
            Manage content, vendors, reviews, and operations across the OpusFesta platform.
          </p>
        </div>
      </div>

      {/* Right — sign-in form */}
      <div className="flex items-center justify-center bg-[#FDFDFD] px-4 py-12">
        <ClerkLoaded>
          <SignIn
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl="/"
            signUpForceRedirectUrl={redirectUrl}
            signUpFallbackRedirectUrl="/"
            appearance={{
              elements: {
                formButtonPrimary: 'bg-[#C9A0DC] hover:bg-[#b97fd0] text-[#1A1A1A]',
                // Hide Clerk's footer (dev-mode branding + "Secured by Clerk").
                footer: 'hidden',
                // Admin access is gated by admin_whitelist (email), so social
                // sign-in adds no value — hide the OAuth buttons and the "or"
                // divider, leaving email-only. NOTE: this is cosmetic; for full
                // removal also disable Apple/Google under Clerk → SSO connections.
                socialButtons: 'hidden',
                socialButtonsBlockButton: 'hidden',
                dividerRow: 'hidden',
              },
            }}
          />
        </ClerkLoaded>

        <ClerkLoading>
          {stalled ? (
            <div className="max-w-sm text-center">
              <h1 className="text-lg font-semibold text-[#1A1A1A]">
                Sign-in is temporarily unavailable
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                We couldn&rsquo;t reach the authentication service. This is usually
                temporary — please try again in a moment. If it keeps happening,
                contact your administrator.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-5 rounded-full bg-[#1A1A1A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
              >
                Retry
              </button>
            </div>
          ) : (
            <div
              className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#C9A0DC]"
              role="status"
              aria-label="Loading sign-in"
            />
          )}
        </ClerkLoading>
      </div>
    </div>
  )
}
