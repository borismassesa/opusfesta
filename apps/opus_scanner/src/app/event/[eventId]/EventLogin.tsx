'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { TriangleAlert, Loader2, ArrowRight, User, ShieldCheck } from 'lucide-react'
import { readSession, writeSession, type ScannerSession } from '@/lib/session'
import { saveRoster } from '@/lib/db'

/** Decorative right-hand visual — a provided animated QR-scanner SVG (SMIL
 * scan-line animation) on OpusPass's soft gradient backdrop. Rendered as a
 * plain <img>, not next/image: Next's image pipeline can strip/break SMIL
 * animations on optimization, and this file is served as-is from /public
 * anyway (no resizing needed). Hidden below lg — this is primarily a
 * mobile device flow, the split-screen only makes sense with room to
 * spare. */
function ScannerVisual() {
  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-white">
      <div className="absolute h-96 w-96 rounded-full bg-gradient-to-br from-[#F0DFF6] via-[#FCE9C2]/40 to-[#E8FBDB]" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/illustrations/qr-code-scanner.svg"
        alt=""
        className="relative h-72 w-72"
      />
    </div>
  )
}

export default function EventLogin({ eventId, urlToken }: { eventId: string; urlToken: string | null }) {
  const router = useRouter()
  const [state, setState] = useState<'checking' | 'attendant' | 'ready' | 'error'>('checking')
  const [session, setSession] = useState<ScannerSession | null>(null)
  const [error, setError] = useState('')
  const [name, setName] = useState('')

  useEffect(() => {
    const existing = readSession(eventId)
    const token = urlToken || existing?.accessToken

    if (!token) {
      setState('error')
      setError('This link is missing an access token. Ask the couple to send you a fresh one.')
      return
    }

    fetch('/api/access/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (!data.ok) {
          setState('error')
          setError(data.error || 'This link is no longer valid.')
          return
        }
        // An admin-assigned code carries its own authoritative name — skip
        // the "who's scanning?" step entirely and go straight to 'ready'.
        // For a couple self-serve token (attendantName null), fall back to
        // whatever was previously typed in on this device, if anything.
        const assignedName: string | undefined = data.attendantName || undefined
        const next: ScannerSession = {
          eventId,
          accessToken: token,
          doorLabel: data.doorLabel,
          eventName: data.event?.name ?? 'Event',
          attendantName: assignedName ?? existing?.attendantName ?? '',
          attendantAssigned: Boolean(assignedName),
        }
        writeSession(next)
        // Cache the roster for offline scanning; failing this shouldn't block
        // login — it just means offline mode won't have fresh data yet.
        saveRoster(eventId, data.roster ?? []).catch(() => {})
        setSession(next)
        setState(next.attendantName ? 'ready' : 'attendant')
      })
      .catch(() => {
        setState('error')
        setError('Could not reach the server. Check your connection and try again.')
      })
    // Re-validate only when the eventId/urlToken pair changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, urlToken])

  function startShift(e: React.FormEvent) {
    e.preventDefault()
    if (!session || !name.trim()) return
    const next: ScannerSession = { ...session, attendantName: name.trim() }
    writeSession(next)
    setSession(next)
    setState('ready')
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      {/* min-w-0 matters here: without it, a grid item's default min-width
          is "auto" (sized to its longest unbreakable content), which can
          force this column wider than its 50% track and squeeze the other
          one — the CSS Grid version of the flex min-width gotcha. */}
      <div className="flex min-w-0 flex-col justify-center px-6 py-12 sm:px-12 lg:px-12 xl:px-20">
        <Image
          src="/assets/logo/OpusPass Logo.svg"
          alt="OpusPass"
          width={203}
          height={65}
          unoptimized
          className="h-11 w-auto lg:h-12"
        />

        <div className="mt-10 max-w-sm">
          {state === 'checking' ? (
            <div className="flex items-center gap-3 text-[#1A1A1A]">
              <Loader2 className="h-5 w-5 animate-spin text-[#8e57b3]" />
              <p className="text-sm text-[#1A1A1A]/70">Verifying your link…</p>
            </div>
          ) : null}

          {state === 'error' ? (
            <div>
              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-500">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#1A1A1A] lg:text-3xl">Link not valid</h1>
              <p className="mt-3 text-base text-[#1A1A1A]/60">{error}</p>
            </div>
          ) : null}

          {state === 'attendant' ? (
            <form onSubmit={startShift}>
              <p className="text-[11px] font-semibold tracking-wide text-[#8e57b3] uppercase">{session?.eventName}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A1A] lg:text-3xl">Who&apos;s scanning?</h1>
              <p className="mt-3 text-base text-[#1A1A1A]/60">
                Enter your name to start your shift at <span className="font-medium text-[#1A1A1A]">{session?.doorLabel}</span>.
              </p>

              <div className="mt-8 flex items-center gap-3 rounded-xl border border-black/[0.12] bg-white px-4 py-1 transition-colors focus-within:border-[#C9A0DC] focus-within:ring-2 focus-within:ring-[#C9A0DC]/30">
                <User className="h-4 w-4 shrink-0 text-[#1A1A1A]/40" />
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-transparent py-3 text-sm text-[#1A1A1A] outline-none placeholder:text-gray-500"
                />
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A0DC] px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-[#1A1A1A] transition-colors hover:bg-[#b97fd0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Start Shift
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : null}

          {state === 'ready' ? (
            <div>
              <p className="text-[11px] font-semibold tracking-wide text-[#8e57b3] uppercase">{session?.eventName}</p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#1A1A1A] lg:text-3xl">{session?.doorLabel}</h1>
              <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-[#E8FBDB] px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-[#3f8b5c] uppercase tracking-wide">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                Checked in as {session?.attendantName}
              </div>

              <button
                type="button"
                onClick={() => router.push(`/event/${eventId}/scan`)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9A0DC] px-6 py-3.5 text-sm font-semibold whitespace-nowrap text-[#1A1A1A] transition-colors hover:bg-[#b97fd0]"
              >
                Enter Portal
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              {/* Admin-assigned codes ARE the identity — there's no separate
                  name step to switch back into, only a different code. */}
              {!session?.attendantAssigned ? (
                <button
                  type="button"
                  onClick={() => {
                    setName('')
                    setState('attendant')
                  }}
                  className="mt-3 text-xs whitespace-nowrap text-[#8e57b3] underline-offset-2 hover:underline"
                >
                  Not {session?.attendantName}? Switch attendant
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="hidden lg:block">
        <ScannerVisual />
      </div>
    </main>
  )
}
