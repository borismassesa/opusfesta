'use client'

import { useState, type FormEvent } from 'react'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { completePasswordReset } from './actions'

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-[15px] text-[#1A1A1A] outline-none transition focus:border-[#1A1A1A] focus:ring-2 focus:ring-[#1A1A1A]/10 placeholder:text-gray-400'
const buttonClass =
  'flex w-full items-center justify-center rounded-lg bg-[#1A1A1A] py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60'
const labelClass = 'mb-2 block text-sm font-medium text-[#1A1A1A]'

const MIN_LENGTH = 8

export default function SetPasswordClient() {
  const { isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isLoaded || !user || busy) return
    setError(null)
    if (newPassword.length < MIN_LENGTH) {
      setError(`Use at least ${MIN_LENGTH} characters.`)
      return
    }
    if (newPassword !== confirm) {
      setError('The two passwords don’t match.')
      return
    }
    setBusy(true)
    // The whole reset runs server-side: Clerk changes the password (enforcing
    // its policy) and clears the gate flag atomically, so the flag can never
    // be cleared without a real password change.
    const result = await completePasswordReset(newPassword)
    if (!result.ok) {
      setError(result.error)
      setBusy(false)
      return
    }
    // Refresh the local user so the (admin) gate sees the cleared flag, then
    // go. The server already cleared it, so a failed reload is non-fatal.
    try {
      await user.reload()
    } catch {
      // ignore — a hard navigation still re-reads the cleared flag
    }
    router.push('/')
  }

  async function onSignOut() {
    try {
      await signOut()
    } finally {
      router.push('/sign-in')
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">
          <Logo className="h-8 w-auto" />

          <h1 className="mt-12 text-[28px] font-bold leading-tight tracking-tight text-[#1A1A1A]">
            Set your password
          </h1>
          <p className="mt-2 text-[15px] text-gray-500">
            Your account was created with a temporary password. Choose your own
            to finish signing in.
          </p>

          <div className="mt-9">
            {error && (
              <p
                className="mb-5 rounded-lg border border-red-100 bg-red-50 px-3.5 py-2.5 text-sm text-red-600"
                role="alert"
              >
                {error}
              </p>
            )}

            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label htmlFor="new" className={labelClass}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new"
                    type={show ? 'text' : 'password'}
                    autoComplete="new-password"
                    autoFocus
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={`At least ${MIN_LENGTH} characters`}
                    className={`${inputClass} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    tabIndex={-1}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    aria-pressed={show}
                    className="absolute inset-y-0 right-0 flex items-center px-3.5 text-gray-400 transition-colors hover:text-[#1A1A1A]"
                  >
                    {show ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm" className={labelClass}>
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type={show ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter your new password"
                  className={inputClass}
                />
              </div>

              <button type="submit" disabled={busy || !isLoaded} className={buttonClass}>
                {busy ? 'Saving…' : 'Set password & continue'}
              </button>
            </form>

            {/* Escape hatch: a user who landed here without the temp password
                (e.g. signed in via an email code) would otherwise be stuck —
                there's no other navigation out of the reset gate. */}
            <p className="mt-6 text-center text-sm text-gray-500">
              Not you?{' '}
              <button
                type="button"
                onClick={onSignOut}
                className="font-medium text-[#1A1A1A] underline-offset-2 hover:underline"
              >
                Sign out
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
