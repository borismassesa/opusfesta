'use client'

import { useEffect, useState } from 'react'
import { SignIn, ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import Logo from '@/components/ui/Logo'

// Clerk loads its UI from its frontend-API host (derived from the publishable
// key). If that host can't be reached — e.g. a custom domain whose DNS isn't
// set up — clerk-js never initialises, <ClerkLoaded> never mounts, and the
// page is blank. This wrapper shows a spinner while loading and, after a grace
// period, a clear "unavailable" message with a retry instead of a dead page.
// The 15s threshold is well beyond a slow-mobile cold load, so the message
// reflects a genuine failure rather than a slow-but-successful init.
const STALL_THRESHOLD_MS = 15000

// Decorative right-panel image. Plain <img> (not next/image) so it needs no
// remotePatterns config; it sits behind a dark overlay and is marked alt="".
const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'

// Clerk <SignIn> theming — strip Clerk's card chrome so the form sits flat on
// the white column, brand the inputs/button, and hide social + footer (admin is
// email-only, gated by admin_whitelist).
const APPEARANCE = {
  variables: {
    colorPrimary: '#1A1A1A',
    colorText: '#1A1A1A',
    colorTextSecondary: '#6B7280',
    colorBackground: '#FFFFFF',
    colorInputText: '#1A1A1A',
    borderRadius: '0.625rem',
    fontSize: '15px',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none',
    card: 'w-full bg-transparent p-0 shadow-none border-none',
    header: 'text-center',
    headerTitle: 'text-2xl font-bold text-[#1A1A1A]',
    headerSubtitle: 'text-gray-500',
    formFieldLabel: 'font-medium text-[#1A1A1A]',
    formFieldInput:
      'rounded-lg border-gray-300 bg-white py-2.5 focus:border-[#1A1A1A] focus:ring-[#1A1A1A]',
    formButtonPrimary:
      'rounded-lg bg-[#1A1A1A] py-2.5 text-sm font-semibold normal-case text-white shadow-none hover:bg-black',
    // Email-only: hide OAuth + the "or" divider.
    socialButtons: 'hidden',
    socialButtonsBlockButton: 'hidden',
    dividerRow: 'hidden',
    // Hide the footer action row ("Don't have an account? Sign up").
    footer: 'hidden',
    footerAction: 'hidden',
  },
} as const

export default function SignInClient({ redirectUrl }: { redirectUrl?: string }) {
  const [stalled, setStalled] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: form (white) ── */}
      <div className="flex flex-col bg-white px-6 py-10 sm:px-12">
        <Logo className="h-7 w-auto" />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <ClerkLoaded>
              <SignIn
                forceRedirectUrl={redirectUrl}
                fallbackRedirectUrl="/"
                signUpForceRedirectUrl={redirectUrl}
                signUpFallbackRedirectUrl="/"
                appearance={APPEARANCE}
              />
            </ClerkLoaded>

            <ClerkLoading>
              {stalled ? (
                <div className="text-center">
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
                    className="mt-5 rounded-lg bg-[#1A1A1A] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <div className="flex justify-center py-10">
                  <div
                    className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1A1A1A]"
                    role="status"
                    aria-label="Loading sign-in"
                  />
                </div>
              )}
            </ClerkLoading>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
          <span>© OpusFesta. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <a href="https://opusfesta.com/privacy-policy" className="hover:text-gray-600">
              Privacy Policy
            </a>
            <a href="https://opusfesta.com/terms-of-use" className="hover:text-gray-600">
              Terms &amp; Conditions
            </a>
          </span>
        </footer>
      </div>

      {/* ── Right: dark feature panel (hidden on small screens) ── */}
      <div className="relative hidden overflow-hidden bg-[#0E0E10] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PANEL_IMAGE}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E10] via-[#0E0E10]/80 to-[#0E0E10]/40" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-4xl">
            Run every celebration from one place
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Manage content, vendors, reviews, and operations across the OpusFesta
            platform — all from one console.
          </p>
          <div className="mt-8 flex gap-2" aria-hidden="true">
            <span className="h-1.5 w-6 rounded-full bg-white" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>
      </div>
    </div>
  )
}
