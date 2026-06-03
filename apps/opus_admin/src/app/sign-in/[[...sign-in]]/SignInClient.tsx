'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Logo from '@/components/ui/Logo'

// Fully headless sign-in: we own the markup, Clerk owns the auth. We call
// Clerk's official useSignIn API (create / prepareFirstFactor / attemptFirstFactor
// / setActive) behind our own UI — no Clerk <SignIn> component, so no Clerk card,
// "Secured by Clerk" badge, "Sign up" link, or dev-mode strip.
//
// Flow: enter email → Clerk tells us the supported first factor(s) →
//   • password  → ask for password
//   • email_code → send a code, ask for it
// On a complete result we activate the session and redirect.

const PANEL_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80'

const STALL_THRESHOLD_MS = 15000

type Step = 'identifier' | 'password' | 'code'

// Pull a human message out of a Clerk error, else a fallback.
function clerkError(err: unknown, fallback: string): string {
  if (typeof err === 'object' && err !== null && 'errors' in err) {
    const errs = (err as { errors?: Array<{ longMessage?: string; message?: string }> }).errors
    const first = errs?.[0]
    if (first) return first.longMessage || first.message || fallback
  }
  return fallback
}

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-[15px] text-[#1A1A1A] outline-none transition focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] placeholder:text-gray-400'
const buttonClass =
  'flex w-full items-center justify-center gap-2 rounded-lg bg-[#1A1A1A] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60'
const labelClass = 'mb-1.5 block text-sm font-medium text-[#1A1A1A]'

export default function SignInClient({ redirectUrl }: { redirectUrl?: string }) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<Step>('identifier')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [emailCodeId, setEmailCodeId] = useState<string | null>(null)
  const [canUseCode, setCanUseCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [stalled, setStalled] = useState(false)

  const dest = redirectUrl || '/'

  useEffect(() => {
    if (isLoaded) return
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [isLoaded])

  // Returns true if the result completed the sign-in (and we've redirected).
  async function complete(result: { status: string | null; createdSessionId: string | null }) {
    if (result.status === 'complete' && result.createdSessionId && setActive) {
      await setActive({ session: result.createdSessionId })
      router.push(dest)
      return true
    }
    return false
  }

  async function onIdentifier(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signIn.create({ identifier: email.trim() })
      const factors = res.supportedFirstFactors ?? []
      const pw = factors.find((f) => f.strategy === 'password')
      const ec = factors.find((f) => f.strategy === 'email_code') as
        | { emailAddressId?: string }
        | undefined
      const ecId = ec?.emailAddressId ?? null

      if (pw) {
        setCanUseCode(Boolean(ecId))
        setEmailCodeId(ecId)
        setStep('password')
      } else if (ecId) {
        await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: ecId })
        setEmailCodeId(ecId)
        setStep('code')
      } else {
        setError('This account has no supported sign-in method.')
      }
    } catch (err) {
      setError(clerkError(err, "Couldn't find your account."))
    } finally {
      setBusy(false)
    }
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signIn.attemptFirstFactor({ strategy: 'password', password })
      if (!(await complete(res))) setError('Additional verification is required to sign in.')
    } catch (err) {
      setError(clerkError(err, 'Incorrect email or password.'))
    } finally {
      setBusy(false)
    }
  }

  async function sendCode() {
    if (!isLoaded || !signIn || !emailCodeId || busy) return
    setError(null)
    setBusy(true)
    try {
      await signIn.prepareFirstFactor({ strategy: 'email_code', emailAddressId: emailCodeId })
      setStep('code')
    } catch (err) {
      setError(clerkError(err, 'Could not send a code.'))
    } finally {
      setBusy(false)
    }
  }

  async function onCode(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signIn.attemptFirstFactor({ strategy: 'email_code', code })
      if (!(await complete(res))) setError('That code didn’t complete sign-in.')
    } catch (err) {
      setError(clerkError(err, 'Invalid or expired code.'))
    } finally {
      setBusy(false)
    }
  }

  function resetToEmail() {
    setStep('identifier')
    setPassword('')
    setCode('')
    setError(null)
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: our custom form (white) ── */}
      <div className="flex flex-col bg-white px-6 py-10 sm:px-12">
        <Logo className="h-7 w-auto" />

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <h1 className="text-2xl font-bold text-[#1A1A1A]">Sign in to OpusFesta Admin</h1>
            <p className="mt-1.5 text-sm text-gray-500">
              {step === 'code'
                ? `Enter the code we sent to ${email}.`
                : 'Welcome back — sign in to continue.'}
            </p>

            {!isLoaded ? (
              <div className="py-12 text-center">
                {stalled ? (
                  <>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Sign-in is temporarily unavailable
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      We couldn&rsquo;t reach the authentication service. Please try again.
                    </p>
                    <button
                      type="button"
                      onClick={() => window.location.reload()}
                      className={`mt-4 ${buttonClass}`}
                    >
                      Retry
                    </button>
                  </>
                ) : (
                  <div
                    className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1A1A1A]"
                    role="status"
                    aria-label="Loading"
                  />
                )}
              </div>
            ) : (
              <div className="mt-8">
                {error && (
                  <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600" role="alert">
                    {error}
                  </p>
                )}

                {step === 'identifier' && (
                  <form onSubmit={onIdentifier} className="space-y-5">
                    <div>
                      <label htmlFor="email" className={labelClass}>
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        autoFocus
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@opusfesta.com"
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? 'Checking…' : 'Continue'}
                    </button>
                  </form>
                )}

                {step === 'password' && (
                  <form onSubmit={onPassword} className="space-y-5">
                    <div>
                      <label htmlFor="password" className={labelClass}>
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="current-password"
                        autoFocus
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetToEmail} className="text-gray-500 hover:text-[#1A1A1A]">
                        Use a different email
                      </button>
                      {canUseCode && (
                        <button type="button" onClick={sendCode} disabled={busy} className="font-medium text-[#1A1A1A] hover:underline">
                          Email me a code instead
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {step === 'code' && (
                  <form onSubmit={onCode} className="space-y-5">
                    <div>
                      <label htmlFor="code" className={labelClass}>
                        Verification code
                      </label>
                      <input
                        id="code"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        autoFocus
                        required
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="Enter the 6-digit code"
                        className={inputClass}
                      />
                    </div>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? 'Verifying…' : 'Verify & sign in'}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetToEmail} className="text-gray-500 hover:text-[#1A1A1A]">
                        Use a different email
                      </button>
                      <button type="button" onClick={sendCode} disabled={busy} className="font-medium text-[#1A1A1A] hover:underline">
                        Resend code
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
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
        <img src={PANEL_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
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
