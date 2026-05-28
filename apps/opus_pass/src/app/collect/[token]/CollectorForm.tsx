'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Heart, Send, CheckCircle2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import { submitCollectorEntry } from './actions'

interface Props {
  token: string
  coupleName: string
  weddingDate: string | null
  city: string | null
}

function formatWeddingDate(value: string | null): string | null {
  if (!value) return null
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function CollectorForm({ token, coupleName, weddingDate, city }: Props) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [pending, startTransition] = useTransition()

  const dateLabel = formatWeddingDate(weddingDate)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Please enter your name')
      return
    }
    startTransition(async () => {
      try {
        await submitCollectorEntry(token, {
          full_name: name.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
        })
        setDone(true)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not save your info')
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#F3E9FA] via-[#FBF7F2] to-white px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-black/5">
        <div className="flex justify-center">
          <Logo className="text-2xl" />
        </div>

        <div className="mt-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#C9A0DC]/15 px-3 py-1 text-xs font-semibold text-[#8e57b3]">
            <Heart className="h-3.5 w-3.5" /> You&apos;re on the list
          </div>
          <h1 className="mt-3 font-serif text-2xl leading-tight text-[#1A1A1A]">{coupleName}</h1>
          {dateLabel ? <p className="mt-1 text-sm text-[#1A1A1A]/55">{dateLabel}</p> : null}
          {city ? <p className="text-sm text-[#1A1A1A]/55">{city}</p> : null}
        </div>

        {done ? (
          <div className="mt-7 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
            <h2 className="mt-3 text-lg font-semibold text-[#1A1A1A]">Thank you!</h2>
            <p className="mt-2 text-sm text-[#1A1A1A]/60">
              {coupleName} got your details. You&apos;ll receive your invitation by WhatsApp soon.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-5 text-sm text-[#1A1A1A]/65">
              {coupleName} is putting together their guest list. Drop your contact details so they can send
              you the invitation and live RSVP link.
            </p>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">Your name *</span>
                <input
                  required
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Asha Mussa"
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#C9A0DC] focus:outline-none focus:ring-1 focus:ring-[#C9A0DC]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">WhatsApp / mobile</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0712 345 678"
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#C9A0DC] focus:outline-none focus:ring-1 focus:ring-[#C9A0DC]"
                />
              </label>

              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-[#1A1A1A]/55">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1.5 block w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#1A1A1A] placeholder:text-gray-400 focus:border-[#C9A0DC] focus:outline-none focus:ring-1 focus:ring-[#C9A0DC]"
                />
              </label>

              <button
                type="submit"
                disabled={pending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#C9A0DC] px-6 py-3 text-sm font-bold text-[#1A1A1A] hover:bg-[#b97fd0] disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
                {pending ? 'Sending…' : 'Send my details'}
              </button>

              <p className="text-center text-[11px] text-[#1A1A1A]/45">
                Your details go straight to {coupleName}. We won&apos;t use them for anything else.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
