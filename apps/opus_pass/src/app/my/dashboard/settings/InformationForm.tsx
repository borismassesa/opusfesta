'use client'

import { useEffect, useState, useTransition } from 'react'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button, Field, inputClass } from '@/components/dashboard/controls'
import { cn } from '@/lib/utils'

export default function InformationForm() {
  const { user, isLoaded } = useUser()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [hydrated, setHydrated] = useState(false)
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    if (isLoaded && user && !hydrated) {
      setFirstName(user.firstName ?? '')
      setLastName(user.lastName ?? '')
      setHydrated(true)
    }
  }, [isLoaded, user, hydrated])

  function save() {
    if (!user) return
    if (!firstName.trim()) {
      toast.error('Enter your first name')
      return
    }
    startTransition(async () => {
      try {
        await user.update({ firstName: firstName.trim(), lastName: lastName.trim() })
        toast.success('Saved')
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save')
      }
    })
  }

  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-bold text-[#1A1A1A]">Your information</h2>
        <div className="mt-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm sm:p-6">
          <div className="grid gap-4">
            <Field label="First name" required>
              <input
                className={inputClass}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={!isLoaded}
              />
            </Field>
            <Field label="Last name" required>
              <input
                className={inputClass}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={!isLoaded}
              />
            </Field>
            <Field label="Email address" required hint="To change your email, use Password and security.">
              <input
                className={cn(inputClass, 'cursor-not-allowed bg-black/[0.03] text-[#1A1A1A]/55')}
                value={email}
                disabled
                readOnly
              />
            </Field>
          </div>
          <div className="mt-5">
            <Button onClick={save} disabled={pending || !isLoaded}>
              {pending ? 'Saving…' : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>

      <ConnectedAccounts />
    </div>
  )
}

function ConnectedAccounts() {
  const { user, isLoaded } = useUser()
  const [pending, setPending] = useState(false)
  const google = user?.externalAccounts.find((a) => a.provider === 'google')

  async function connect() {
    if (!user) return
    setPending(true)
    try {
      const account = await user.createExternalAccount({
        strategy: 'oauth_google',
        redirectUrl: window.location.href,
      })
      const redirect = account.verification?.externalVerificationRedirectURL
      if (redirect) window.location.href = redirect.toString()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not connect')
      setPending(false)
    }
  }

  async function disconnect() {
    if (!google) return
    setPending(true)
    try {
      await google.destroy()
      await user?.reload()
      toast.success('Disconnected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not disconnect')
    } finally {
      setPending(false)
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-[#1A1A1A]">Connected accounts</h2>
      <p className="mt-1 text-sm text-[#1A1A1A]/55">Connect your accounts to sign in faster.</p>
      <div className="mt-4 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-sm sm:p-6">
        {!isLoaded ? null : google ? (
          <>
            <p className="mb-2 text-sm font-semibold text-[#1A1A1A]">Currently connected</p>
            <button
              type="button"
              onClick={disconnect}
              disabled={pending}
              className="text-sm font-medium text-[#7E5896] underline underline-offset-2 hover:text-[#5f4171] disabled:opacity-50"
            >
              Disconnect with Google
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={connect}
            disabled={pending}
            className="text-sm font-medium text-[#7E5896] underline underline-offset-2 hover:text-[#5f4171] disabled:opacity-50"
          >
            Connect with Google
          </button>
        )}
      </div>
    </div>
  )
}
