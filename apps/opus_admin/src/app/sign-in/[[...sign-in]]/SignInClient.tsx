'use client'

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react'
import { useAuth, useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
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

// Self-hosted in public/ so the panel can't break on a third-party hotlink.
const PANEL_IMAGE = '/auth-panel.jpg'

const STALL_THRESHOLD_MS = 15000
const CODE_LENGTH = 6
// Per-tab marker so the already-signed-in auto-redirect only fires once and
// can't become a reload loop. See the effect in SignInClient.
const REDIRECT_GUARD_KEY = 'opus_admin_signin_redirected'

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
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none transition focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 placeholder:text-gray-400'
const buttonClass =
  'flex w-full items-center justify-center rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60'
const labelClass = 'mb-2 block text-sm font-medium text-[#1A1A1A]'
const linkClass = 'font-medium text-[#1A1A1A] underline-offset-2 hover:underline disabled:opacity-60'

export default function SignInClient({ redirectUrl }: { redirectUrl?: string }) {
  const { isLoaded, signIn, setActive } = useSignIn()
  const { isLoaded: authLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>('identifier')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [code, setCode] = useState('')
  const [emailCodeId, setEmailCodeId] = useState<string | null>(null)
  const [canUseCode, setCanUseCode] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [stalled, setStalled] = useState(false)
  const [redirecting, setRedirecting] = useState(false)

  const dest = redirectUrl || '/'

  // Client-side counterpart of the server guard in page.tsx. /sign-in is a
  // public route, so Clerk's middleware never runs a handshake here — when the
  // apex session (shared across *.opusfesta.com) is only hydrated in the
  // client SDK, the server's auth() sees no userId and renders this form. If we
  // then let the user submit, Clerk rejects signIn.create() with a 400
  // "You're already signed in". So: as soon as the client SDK reports an active
  // session, bail out of the form and do a FULL-PAGE navigation to the
  // destination. Going through a protected route triggers Clerk's middleware
  // handshake, which mints the server __session cookie and lands the user on
  // the dashboard (or /contribute, per the (admin) layout's whitelist gate).
  const alreadySignedIn = authLoaded && isSignedIn
  useEffect(() => {
    if (!alreadySignedIn) return
    // One-shot guard against a reload loop. If the server STILL can't establish
    // a session after we bounce through the protected route (a genuine
    // cross-instance apex-cookie collision, or a handshake that can't resolve),
    // auth.protect() sends us right back to /sign-in — where we'd be signed-in
    // again and redirect again, forever. Remember that we already tried once
    // (per tab) and fall through to the form instead of looping. Cleared on a
    // successful sign-in in complete().
    if (sessionStorage.getItem(REDIRECT_GUARD_KEY)) return
    sessionStorage.setItem(REDIRECT_GUARD_KEY, '1')
    setRedirecting(true)
    window.location.replace(dest)
  }, [alreadySignedIn, dest])

  useEffect(() => {
    if (isLoaded) return
    const t = setTimeout(() => setStalled(true), STALL_THRESHOLD_MS)
    return () => clearTimeout(t)
  }, [isLoaded])

  // Returns true if the result completed the sign-in (and we've redirected).
  async function complete(result: { status: string | null; createdSessionId: string | null }) {
    if (result.status === 'complete' && result.createdSessionId && setActive) {
      // Fresh, valid session — clear the loop guard so a later visit can
      // auto-redirect again if needed.
      sessionStorage.removeItem(REDIRECT_GUARD_KEY)
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

  const subtitle = redirecting
    ? 'Welcome back.'
    : step === 'code'
      ? `Enter the code we sent to ${email}.`
      : step === 'password'
        ? 'Enter your password to continue.'
        : 'Welcome back — sign in to continue.'

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Left: our custom form (white) ── */}
      <div className="flex min-h-screen flex-col bg-white">
        <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20">
          <div className="mx-auto w-full max-w-[400px]">
            <Logo className="h-8 w-auto" />

            <h1 className="mt-12 text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
              Sign in to OpusFesta Admin
            </h1>
            <p className="mt-2 text-[15px] text-gray-500">{subtitle}</p>

            {redirecting ? (
              <div className="py-14 text-center">
                <div
                  className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1A1A1A]"
                  role="status"
                  aria-label="Redirecting"
                />
                <p className="mt-4 text-sm text-gray-500">
                  You&rsquo;re already signed in — taking you to your dashboard…
                </p>
              </div>
            ) : !isLoaded ? (
              <div className="py-14 text-center">
                {stalled ? (
                  <>
                    <p className="text-sm font-medium text-[#1A1A1A]">
                      Sign-in is temporarily unavailable
                    </p>
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
                    className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1A1A1A]"
                    role="status"
                    aria-label="Loading"
                  />
                )}
              </div>
            ) : (
              <div className="mt-9">
                {error && (
                  <p
                    className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                    role="alert"
                  >
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
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="current-password"
                          autoFocus
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className={`${inputClass} pr-12`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          tabIndex={-1}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                          aria-pressed={showPassword}
                          className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 transition-colors hover:text-[#1A1A1A]"
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5" aria-hidden="true" />
                          ) : (
                            <Eye className="h-5 w-5" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={busy} className={buttonClass}>
                      {busy ? 'Signing in…' : 'Sign in'}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetToEmail} className="text-gray-500 hover:text-[#1A1A1A]">
                        Use a different email
                      </button>
                      {canUseCode && (
                        <button type="button" onClick={sendCode} disabled={busy} className={linkClass}>
                          Email me a code instead
                        </button>
                      )}
                    </div>
                  </form>
                )}

                {step === 'code' && (
                  <form onSubmit={onCode} className="space-y-5">
                    <div>
                      <label htmlFor="code-0" className={labelClass}>
                        Verification code
                      </label>
                      <CodeInput value={code} onChange={setCode} disabled={busy} />
                    </div>
                    <button
                      type="submit"
                      disabled={busy || code.length < CODE_LENGTH}
                      className={buttonClass}
                    >
                      {busy ? 'Verifying…' : 'Verify & sign in'}
                    </button>
                    <div className="flex items-center justify-between text-sm">
                      <button type="button" onClick={resetToEmail} className="text-gray-500 hover:text-[#1A1A1A]">
                        Use a different email
                      </button>
                      <button type="button" onClick={sendCode} disabled={busy} className={linkClass}>
                        Resend code
                      </button>
                    </div>
                  </form>
                )}

                <p className="mt-8 text-center text-xs leading-relaxed text-gray-400">
                  Restricted to OpusFesta staff. Access is granted by invitation.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-8 pb-8 sm:px-12 lg:px-20">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400">
            <span>© OpusFesta. All rights reserved.</span>
            <span className="flex items-center gap-5">
              <a href="https://opusfesta.com/privacy-policy" className="hover:text-gray-600">
                Privacy Policy
              </a>
              <a href="https://opusfesta.com/terms-of-use" className="hover:text-gray-600">
                Terms &amp; Conditions
              </a>
            </span>
          </div>
        </div>
      </div>

      {/* ── Right: dark feature panel (hidden on small screens) ── */}
      <div className="relative hidden overflow-hidden bg-[#0E0E10] lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={PANEL_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <h2 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-[40px] xl:leading-[1.1]">
            Run every celebration from one place
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
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

// Segmented 6-box one-time-code input. Each box holds one digit; typing
// auto-advances, Backspace steps back, arrows move between boxes, and pasting
// a full code fills every box at once. The combined value is reported up via
// onChange so the parent's existing `code` state and submit flow are unchanged.
function CodeInput({
  value,
  onChange,
  disabled,
}: {
  value: string
  onChange: (next: string) => void
  disabled?: boolean
}) {
  const refs = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? '')

  const focusAt = (i: number) => {
    const clamped = Math.max(0, Math.min(i, CODE_LENGTH - 1))
    refs.current[clamped]?.focus()
    refs.current[clamped]?.select()
  }

  const handleChange = (i: number, raw: string) => {
    const onlyDigits = raw.replace(/\D/g, '')
    if (!onlyDigits) {
      // Cleared box.
      const next = digits.slice()
      next[i] = ''
      onChange(next.join(''))
      return
    }
    // A single keystroke or a paste of several digits both land here.
    const incoming = onlyDigits.split('')
    const next = digits.slice()
    let cursor = i
    for (const ch of incoming) {
      if (cursor >= CODE_LENGTH) break
      next[cursor] = ch
      cursor += 1
    }
    onChange(next.join('').slice(0, CODE_LENGTH))
    focusAt(cursor)
  }

  const handleKeyDown = (i: number, e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = digits.slice()
      if (digits[i]) {
        next[i] = ''
        onChange(next.join(''))
      } else if (i > 0) {
        next[i - 1] = ''
        onChange(next.join(''))
        focusAt(i - 1)
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      focusAt(i - 1)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      focusAt(i + 1)
    }
  }

  return (
    <div className="flex gap-2 sm:gap-2.5" role="group" aria-label="Verification code">
      {digits.map((digit, i) => (
        <input
          key={i}
          id={`code-${i}`}
          ref={(el) => {
            refs.current[i] = el
          }}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={CODE_LENGTH}
          autoFocus={i === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1}`}
          className="h-14 w-full rounded-lg border border-gray-300 bg-white text-center text-xl font-semibold text-[#1A1A1A] outline-none transition focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 disabled:opacity-60"
        />
      ))}
    </div>
  )
}
