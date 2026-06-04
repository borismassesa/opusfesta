'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'
import CodeBoxes from '@/components/CodeBoxes'

// Fully headless sign-in — the counterpart to SignUpClient. We own the markup,
// Clerk owns the auth (useSignIn: create / authenticateWithRedirect /
// prepareFirstFactor / attemptFirstFactor / setActive). No Clerk <SignIn>
// component, so no Clerk card chrome — it matches the custom sign-up exactly.
//
// Flows:
//   • password: email + password → activate session → /dashboard
//   • OAuth:    Google/Apple → hand off, return through /sso-callback
//   • reset:    "Forgot password" → Clerk emails a code → set a new password

const AFTER_SIGN_IN_URL = '/dashboard'
const STALL_THRESHOLD_MS = 15000

type Step = 'password' | 'forgot' | 'reset'

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
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none transition focus:border-[#C9A0DC] focus:ring-2 focus:ring-[#C9A0DC]/25 placeholder:text-gray-400'
const buttonClass =
  'flex w-full items-center justify-center rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60'
const oauthButtonClass =
  'flex w-full items-center justify-center gap-2.5 rounded-lg border border-gray-300 bg-white py-3 text-sm font-medium text-[#1A1A1A] transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60'
const labelClass = 'mb-2 block text-sm font-medium text-[#1A1A1A]'
const linkClass = 'font-medium text-[#7E5896] underline-offset-2 hover:underline disabled:opacity-60'

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="#1A1A1A" aria-hidden="true">
      <path d="M12.5 9.55c.02 2.2 1.93 2.93 1.95 2.94-.02.05-.31 1.05-1.01 2.08-.6.9-1.24 1.79-2.24 1.81-.98.02-1.3-.58-2.42-.58-1.12 0-1.47.56-2.4.6-.97.03-1.7-.97-2.31-1.86-1.24-1.8-2.19-5.1-.91-7.32a3.57 3.57 0 0 1 3.01-1.83c.96-.02 1.86.65 2.45.65.58 0 1.68-.8 2.83-.68.48.02 1.84.19 2.71 1.46-.07.05-1.62.95-1.6 2.83ZM10.7 3.3c.52-.63.87-1.5.78-2.37-.75.03-1.66.5-2.2 1.13-.48.55-.9 1.44-.79 2.29.84.06 1.69-.42 2.21-1.05Z" />
    </svg>
  )
}

export default function SignInClient({ redirectUrl }: { redirectUrl?: string }) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const router = useRouter()

  const [step, setStep] = useState<Step>('password')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<'google' | 'apple' | null>(null)
  const [stalled, setStalled] = useState(false)

  const dest = redirectUrl || AFTER_SIGN_IN_URL

  useEffect(() => {
    if (isLoaded) return
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [isLoaded])

  async function activate(createdSessionId: string | null) {
    if (createdSessionId && setActive) {
      await setActive({ session: createdSessionId })
      router.push(dest)
      return true
    }
    return false
  }

  async function onPassword(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signIn.create({ identifier: email.trim(), password })
      if (res.status === 'complete') {
        if (!(await activate(res.createdSessionId))) {
          setError('Additional verification is required to sign in.')
        }
      } else {
        setError('Additional verification is required to sign in.')
      }
    } catch (err) {
      setError(clerkError(err, 'Incorrect email or password.'))
    } finally {
      setBusy(false)
    }
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      await signIn.create({ strategy: 'reset_password_email_code', identifier: email.trim() })
      setStep('reset')
    } catch (err) {
      setError(clerkError(err, "We couldn't send a reset code to that email."))
    } finally {
      setBusy(false)
    }
  }

  async function onReset(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signIn || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
        password: newPassword,
      })
      if (res.status === 'complete') {
        if (!(await activate(res.createdSessionId))) {
          setError('Your password was reset, but sign-in needs another step.')
        }
      } else {
        setError('That code didn’t complete the reset. Please try again.')
      }
    } catch (err) {
      setError(clerkError(err, 'Invalid or expired code.'))
    } finally {
      setBusy(false)
    }
  }

  async function onOAuth(provider: 'google' | 'apple') {
    if (!isLoaded || !signIn || oauthBusy) return
    setError(null)
    setOauthBusy(provider)
    try {
      await signIn.authenticateWithRedirect({
        strategy: provider === 'google' ? 'oauth_google' : 'oauth_apple',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: dest,
      })
    } catch (err) {
      setError(clerkError(err, `Couldn't continue with ${provider === 'google' ? 'Google' : 'Apple'}.`))
      setOauthBusy(null)
    }
  }

  function backToSignIn() {
    setStep('password')
    setCode('')
    setNewPassword('')
    setError(null)
  }

  const subtitle =
    step === 'forgot'
      ? 'Enter your email and we’ll send a reset code.'
      : step === 'reset'
        ? `Enter the code we sent to ${email} and choose a new password.`
        : 'Welcome back — sign in to manage your storefront.'

  return (
    <AuthShell
      panelTitle="Welcome back to OpusFesta"
      panelSubtitle="Pick up right where you left off — your leads, bookings, and storefront, all in one place."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Sign in to your account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">{subtitle}</p>

      {!isLoaded ? (
        <div className="mt-6 py-14 text-center">
          {stalled ? (
            <>
              <p className="text-sm font-medium text-[#1A1A1A]">Sign-in is temporarily unavailable</p>
              <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
                We couldn&rsquo;t reach the authentication service. Please try again.
              </p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={`mt-5 ${buttonClass}`}
              >
                Retry
              </button>
            </>
          ) : (
            <div
              className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#C9A0DC]"
              role="status"
              aria-label="Loading"
            />
          )}
        </div>
      ) : (
        <div className="mt-6">
          {error && (
            <p
              className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {step === 'password' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => onOAuth('google')}
                  disabled={Boolean(oauthBusy)}
                  className={oauthButtonClass}
                >
                  <GoogleIcon />
                  {oauthBusy === 'google' ? 'Redirecting…' : 'Google'}
                </button>
                <button
                  type="button"
                  onClick={() => onOAuth('apple')}
                  disabled={Boolean(oauthBusy)}
                  className={oauthButtonClass}
                >
                  <AppleIcon />
                  {oauthBusy === 'apple' ? 'Redirecting…' : 'Apple'}
                </button>
              </div>

              <div className="my-5 flex items-center gap-3">
                <span className="h-px flex-1 bg-gray-200" />
                <span className="text-xs font-medium uppercase tracking-wider text-gray-400">or</span>
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <form onSubmit={onPassword} className="space-y-4">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.co.tz"
                    className={inputClass}
                  />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setStep('forgot')
                        setError(null)
                      }}
                      className={linkClass}
                    >
                      Forgot password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
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
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                New to OpusFesta?{' '}
                <Link href="/sign-up" className={linkClass}>
                  Create an account
                </Link>
              </p>
            </>
          )}

          {step === 'forgot' && (
            <form onSubmit={onForgot} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className={labelClass}>
                  Email address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@business.co.tz"
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={busy} className={buttonClass}>
                {busy ? 'Sending…' : 'Send reset code'}
              </button>
              <button
                type="button"
                onClick={backToSignIn}
                className="block w-full text-center text-sm text-gray-500 hover:text-[#1A1A1A]"
              >
                Back to sign in
              </button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={onReset} className="space-y-4">
              <div>
                <span className={labelClass}>Verification code</span>
                <CodeBoxes value={code} onChange={setCode} autoFocus disabled={busy} />
              </div>
              <div>
                <label htmlFor="new-password" className={labelClass}>
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className={inputClass}
                />
              </div>
              <button
                type="submit"
                disabled={busy || code.replace(/\D/g, '').length < 6}
                className={buttonClass}
              >
                {busy ? 'Resetting…' : 'Reset password & sign in'}
              </button>
              <button
                type="button"
                onClick={backToSignIn}
                className="block w-full text-center text-sm text-gray-500 hover:text-[#1A1A1A]"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      )}
    </AuthShell>
  )
}
