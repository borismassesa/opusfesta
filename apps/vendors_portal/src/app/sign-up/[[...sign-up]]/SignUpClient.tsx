'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthShell from '@/components/AuthShell'
import CodeBoxes from '@/components/CodeBoxes'

// Fully headless sign-up: we own the markup, Clerk owns the auth. We call
// Clerk's official useSignUp API (create / prepareEmailAddressVerification /
// attemptEmailAddressVerification / authenticateWithRedirect / setActive)
// behind our own UI — no Clerk <SignUp> component.
//
// Why headless: the stock <SignUp> swallowed the email + password path —
// social sign-up (Google) completed because the provider returns an
// already-verified email, but email/password requires Clerk's email-code
// verification step, and any failure there was invisible. Owning the flow lets
// us drive that step explicitly and surface the real error.
//
// Flow (email/password): enter name + email + password → Clerk emails a 6-digit
// code → enter the code → activate the session and continue to /onboard.
// Flow (OAuth): hand off to the provider, return through /sso-callback.

const AFTER_SIGN_UP_URL = '/onboard'
const STALL_THRESHOLD_MS = 15000

type Step = 'details' | 'verify'

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

export default function SignUpClient() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [step, setStep] = useState<Step>('details')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [oauthBusy, setOauthBusy] = useState<'google' | null>(null)
  const [stalled, setStalled] = useState(false)

  useEffect(() => {
    if (isLoaded) return
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [isLoaded])

  async function onDetails(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signUp || busy) return
    setError(null)
    setBusy(true)
    try {
      await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        emailAddress: email.trim(),
        password,
      })
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
      setStep('verify')
    } catch (err) {
      setError(clerkError(err, "We couldn't create your account. Please check your details and try again."))
    } finally {
      setBusy(false)
    }
  }

  async function onVerify(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !signUp || busy) return
    setError(null)
    setBusy(true)
    try {
      const res = await signUp.attemptEmailAddressVerification({ code: code.trim() })
      if (res.status === 'complete' && res.createdSessionId && setActive) {
        await setActive({ session: res.createdSessionId })
        router.push(AFTER_SIGN_UP_URL)
      } else {
        setError('That code didn’t complete sign-up. Please try again.')
      }
    } catch (err) {
      setError(clerkError(err, 'Invalid or expired code.'))
    } finally {
      setBusy(false)
    }
  }

  async function resendCode() {
    if (!isLoaded || !signUp || busy) return
    setError(null)
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })
    } catch (err) {
      setError(clerkError(err, 'Could not resend the code.'))
    }
  }

  async function onOAuth(provider: 'google') {
    if (!isLoaded || !signUp || oauthBusy) return
    setError(null)
    setOauthBusy(provider)
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: AFTER_SIGN_UP_URL,
      })
    } catch (err) {
      setError(clerkError(err, "Couldn't continue with Google."))
      setOauthBusy(null)
    }
  }

  function resetToDetails() {
    setStep('details')
    setCode('')
    setError(null)
  }

  const subtitle =
    step === 'verify'
      ? `Enter the 6-digit code we sent to ${email}.`
      : 'Apply to do business on OpusFesta — it takes a couple of minutes.'

  return (
    <AuthShell
      panelTitle="Grow your business with OpusFesta"
      panelSubtitle="List your services, reach couples planning their big day, and manage every booking — leads, quotes, and payments — from one dashboard."
    >
      <h1 className="text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
        Create your vendor account
      </h1>
      <p className="mt-2 text-[15px] text-gray-500">{subtitle}</p>

          {!isLoaded ? (
            <div className="py-14 text-center">
              {stalled ? (
                <>
                  <p className="text-sm font-medium text-[#1A1A1A]">Sign-up is temporarily unavailable</p>
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
                  className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {step === 'details' && (
                <>
                  <button
                    type="button"
                    onClick={() => onOAuth('google')}
                    disabled={Boolean(oauthBusy)}
                    className={`w-full ${oauthButtonClass}`}
                  >
                    <GoogleIcon />
                    {oauthBusy === 'google' ? 'Redirecting…' : 'Continue with Google'}
                  </button>

                  <div className="my-5 flex items-center gap-3">
                    <span className="h-px flex-1 bg-gray-200" />
                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                      or
                    </span>
                    <span className="h-px flex-1 bg-gray-200" />
                  </div>

                  <form onSubmit={onDetails} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="firstName" className={labelClass}>
                          First name
                        </label>
                        <input
                          id="firstName"
                          type="text"
                          autoComplete="given-name"
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="Amani"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className={labelClass}>
                          Last name
                        </label>
                        <input
                          id="lastName"
                          type="text"
                          autoComplete="family-name"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Mushi"
                          className={inputClass}
                        />
                      </div>
                    </div>
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
                      <label htmlFor="password" className={labelClass}>
                        Password
                      </label>
                      <input
                        id="password"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={inputClass}
                      />
                    </div>

                    {/* Clerk bot-protection (smart CAPTCHA) mounts here. Required
                        for headless signUp.create(); omitting it makes create()
                        fail when bot protection is enabled on the instance. */}
                    <div id="clerk-captcha" />

                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? 'Creating account…' : 'Create account'}
                    </button>
                  </form>
                </>
              )}

              {step === 'verify' && (
                <form onSubmit={onVerify} className="space-y-5">
                  <div>
                    <span className={labelClass}>Verification code</span>
                    <CodeBoxes
                      value={code}
                      onChange={setCode}
                      autoFocus
                      disabled={busy}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={busy || code.replace(/\D/g, '').length < 6}
                    className={buttonClass}
                  >
                    {busy ? 'Verifying…' : 'Verify & continue'}
                  </button>
                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={resetToDetails}
                      className="text-gray-500 hover:text-[#1A1A1A]"
                    >
                      Use different details
                    </button>
                    <button type="button" onClick={resendCode} disabled={busy} className={linkClass}>
                      Resend code
                    </button>
                  </div>
                </form>
              )}

              {step === 'details' && (
                <p className="mt-6 text-center text-sm text-gray-500">
                  Already have an account?{' '}
                  <Link href="/sign-in" className={linkClass}>
                    Sign in
                  </Link>
                </p>
              )}
            </div>
          )}
    </AuthShell>
  )
}
