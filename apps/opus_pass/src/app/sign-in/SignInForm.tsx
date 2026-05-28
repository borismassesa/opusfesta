'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from '@/components/ui/Logo'
import { getSupabaseBrowserClient } from '@/lib/supabase-browser'

interface Props {
  returnTo: string
  seed: boolean
  sentEmail: string | null
  errorCode: string | null
}

const ERROR_HINTS: Record<string, string> = {
  missing_code: "That sign-in link didn't carry a code. Send yourself a fresh one below.",
  wrong_browser:
    'Open the sign-in link in the same browser you used to request it. Or just request a fresh link below.',
  expired_link: 'Your sign-in link expired. Request a fresh one — they only last about an hour.',
  unknown: "Couldn't finish signing you in. Try requesting a fresh link below.",
}

export default function SignInForm({ returnTo, seed, sentEmail, errorCode }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>(
    sentEmail ? 'sent' : 'idle',
  )
  const [error, setError] = useState<string | null>(null)
  const [hint, setHint] = useState<string | null>(
    errorCode ? (ERROR_HINTS[errorCode] ?? ERROR_HINTS.unknown) : null,
  )
  const [lastEmail, setLastEmail] = useState<string | null>(sentEmail)

  // Strip the error param from the URL so it stops sitting in the address bar.
  // The hint stays visible in component state.
  useEffect(() => {
    if (!errorCode || typeof window === 'undefined') return
    const url = new URL(window.location.href)
    url.searchParams.delete('error')
    window.history.replaceState(null, '', url.pathname + (url.search ? url.search : ''))
  }, [errorCode])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('sending')
    setError(null)
    setHint(null)

    const params = new URLSearchParams({ return_to: returnTo })
    if (seed) params.set('seed', '1')
    const redirectTo = `${window.location.origin}/api/auth/callback?${params.toString()}`

    const supabase = getSupabaseBrowserClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
    })

    if (error) {
      setStatus('error')
      setError(error.message)
      return
    }
    setLastEmail(email)
    setStatus('sent')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5">
        <div className="flex justify-center">
          <Logo className="mb-6 text-3xl" />
        </div>

        {status === 'sent' && lastEmail ? (
          <div className="text-center">
            <h1 className="text-xl font-bold text-[#1A1A1A]">Check your email</h1>
            <p className="mt-3 text-sm text-[#1A1A1A]/60">
              We sent a sign-in link to <span className="font-semibold text-[#1A1A1A]">{lastEmail}</span>.
              Tap the link from your phone or laptop to land in your dashboard.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle')
                setError(null)
              }}
              className="mt-6 text-sm font-semibold text-[#8e57b3] hover:underline"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-center text-xl font-bold text-[#1A1A1A]">Welcome to OpusPass</h1>
            <p className="mt-2 text-center text-sm text-[#1A1A1A]/60">
              Enter your email and we&apos;ll send you a sign-in link. No password.
            </p>

            {hint ? (
              <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                {hint}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/60">Email</span>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A]"
                />
              </label>

              {error ? <p className="text-sm text-rose-600">{error}</p> : null}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full rounded-full bg-(--accent) px-6 py-3 text-sm font-bold text-(--on-accent) transition-colors hover:bg-(--accent-hover) disabled:opacity-50"
              >
                {status === 'sending' ? 'Sending…' : 'Send me a sign-in link'}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[#1A1A1A]/50">
              By continuing you agree to our{' '}
              <Link href="/terms" className="underline hover:text-[#1A1A1A]">
                terms
              </Link>
              .
            </p>
          </>
        )}
      </div>
    </div>
  )
}
