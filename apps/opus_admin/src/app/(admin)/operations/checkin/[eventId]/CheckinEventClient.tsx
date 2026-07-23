'use client'

import { useEffect, useState, useTransition } from 'react'
import {
  ChevronDown,
  Copy,
  DoorOpen,
  Loader2,
  RotateCw,
  ShieldCheck,
  ShieldOff,
  UserPlus,
  UserRoundX,
} from 'lucide-react'
import { assignAttendant, revokeAttendant, type AttendantAssignment } from '../actions'
import {
  ACCESS_CODE_VALIDITY_OPTIONS,
  formatScannerAccessCode,
  type AccessCodeValidity,
} from '@/lib/checkin-code'

export interface CheckinBaseline {
  event: { id: string; name: string; eventType: string; startsAt: string | null; coupleName: string | null } | null
  totalAttending: number
  totalCheckedIn: number
  recent: { guestName: string; doorLabel: string | null; checkedInAt: string }[]
}

interface FeedEntry {
  guestName: string
  doorLabel: string | null
  checkedInAt: string
  duplicate?: boolean
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function statusLabel(a: AttendantAssignment, nowMs: number): { text: string; tone: string } {
  if (a.revokedAt) return { text: 'Revoked', tone: 'text-gray-400' }
  if (new Date(a.expiresAt).getTime() < nowMs) return { text: 'Expired', tone: 'text-amber-600' }
  return { text: 'Active', tone: 'text-emerald-600' }
}

/** A code that can still open a door right now. Revoked and expired codes are
 *  kept for audit but can't be used, so they're listed separately. */
function isUsable(a: AttendantAssignment, nowMs: number): boolean {
  return !a.revokedAt && new Date(a.expiresAt).getTime() > nowMs
}

function AttendantRow({
  attendant: a,
  nowMs,
  pending,
  muted = false,
  onRevoke,
  onReassign,
}: {
  attendant: AttendantAssignment
  nowMs: number
  pending: boolean
  /** Spent codes are listed for audit, so they read quieter than live ones. */
  muted?: boolean
  onRevoke: () => void
  onReassign: () => void
}) {
  const status = statusLabel(a, nowMs)
  const canRevoke = isUsable(a, nowMs)

  return (
    <div className={`flex items-center justify-between px-5 py-3 ${muted ? 'bg-gray-50/60' : ''}`}>
      <div className="min-w-0">
        <p className={`truncate text-sm ${muted ? 'text-gray-500' : 'font-medium text-gray-900'}`}>
          {a.attendantName}
        </p>
        <p className="text-xs text-gray-500">
          {a.doorLabel} · <span className={status.tone}>{status.text}</span>
          {a.lastUsedAt ? ` · last used ${formatTime(a.lastUsedAt)}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {canRevoke ? (
          <button
            onClick={onRevoke}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-rose-200 hover:text-rose-600 disabled:opacity-40"
          >
            <ShieldOff className="h-3.5 w-3.5" /> Revoke
          </button>
        ) : (
          <button
            onClick={onReassign}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-[#C9A0DC] hover:text-[#8e57b3] disabled:opacity-40"
          >
            <RotateCw className="h-3.5 w-3.5" /> Reassign
          </button>
        )}
      </div>
    </div>
  )
}

export default function CheckinEventClient({
  eventId,
  baseline,
  initialAttendants,
}: {
  eventId: string
  baseline: CheckinBaseline
  initialAttendants: AttendantAssignment[]
}) {
  // ---- Live attendance (same pattern as opus_pass's LiveAttendance) ----
  const [checkedIn, setCheckedIn] = useState(baseline.totalCheckedIn)
  const [feed, setFeed] = useState<FeedEntry[]>(
    baseline.recent.map((r) => ({ guestName: r.guestName, doorLabel: r.doorLabel, checkedInAt: r.checkedInAt })),
  )
  const [connected, setConnected] = useState(false)

  // Live feed — polled from a permission-gated server endpoint
  // (/api/checkin/arrivals) rather than an anon Realtime Broadcast channel,
  // which was world-readable: anyone with the public anon key who knew an
  // eventId could subscribe and watch a stranger's guests check in. The
  // baseline above renders immediately; the poll keeps it current.
  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(`/api/checkin/arrivals?event=${encodeURIComponent(eventId)}`, {
          cache: 'no-store',
        })
        if (!res.ok) throw new Error(`arrivals poll failed: ${res.status}`)
        const json = (await res.json()) as {
          arrivals: { guestName: string; doorLabel: string | null; checkedInAt: string }[]
          totalCheckedIn: number
        }
        if (cancelled) return
        setConnected(true)
        setFeed(json.arrivals)
        setCheckedIn(json.totalCheckedIn)
      } catch {
        if (!cancelled) setConnected(false)
      }
    }

    poll()
    const t = setInterval(poll, 5000)
    return () => {
      cancelled = true
      setConnected(false)
      clearInterval(t)
    }
  }, [eventId])

  const pct = baseline.totalAttending > 0 ? Math.round((checkedIn / baseline.totalAttending) * 100) : 0

  // ---- Assign attendant form + one-time reveal ----
  const [attendants, setAttendants] = useState(initialAttendants)
  const [name, setName] = useState('')
  const [door, setDoor] = useState('Main Gate')
  // Defaults to the event window; the fixed durations are deliberate
  // overrides, so the safe option is never the one you have to remember.
  const [validity, setValidity] = useState<AccessCodeValidity>('event')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [reveal, setReveal] = useState<{
    attendantName: string
    token: string
    link: string
    expiresAt: string
    linkWarning?: string
  } | null>(null)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [showSpent, setShowSpent] = useState(false)

  // Per-render snapshot, matching how expiry was already evaluated here.
  // eslint-disable-next-line react-hooks/purity -- expiry is time-relative; no SSR/hydration split on this client route
  const nowMs = Date.now()
  const usable = attendants.filter((a) => isUsable(a, nowMs))
  const spent = attendants.filter((a) => !isUsable(a, nowMs))

  function runAssign(
    attendantName: string,
    doorLabel: string,
    codeValidity: AccessCodeValidity,
    onDone?: () => void,
  ) {
    setError('')
    startTransition(async () => {
      const result = await assignAttendant(eventId, attendantName, doorLabel, codeValidity)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setReveal({
        attendantName,
        token: result.token,
        link: result.link,
        expiresAt: result.expiresAt,
        linkWarning: result.linkWarning,
      })
      setAttendants((prev) => [
        {
          id: crypto.randomUUID(),
          doorLabel: doorLabel.trim() || 'Main Gate',
          attendantName,
          expiresAt: result.expiresAt,
          revokedAt: null,
          lastUsedAt: null,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ])
      onDone?.()
    })
  }

  function submitAssign(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    runAssign(trimmed, door, validity, () => setName(''))
  }

  /** Issue a fresh code for a revoked/expired attendant under the same
   * name + door — the old code stays dead, this is a brand new row/token,
   * not a resurrection of the old one (the raw token was never stored, so
   * there's nothing to "unrevoke" into). Re-issues on the event window
   * rather than whatever was last picked in the form, so a one-off long
   * test code can't silently become the norm for every later re-issue. */
  function reassign(a: AttendantAssignment) {
    runAssign(a.attendantName, a.doorLabel, 'event')
  }

  function copy(value: string, which: 'code' | 'link') {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(which)
      setTimeout(() => setCopied(null), 1500)
    })
  }

  function revoke(id: string) {
    startTransition(async () => {
      const result = await revokeAttendant(id, eventId)
      if (!result.ok) return
      setAttendants((prev) => prev.map((a) => (a.id === id ? { ...a, revokedAt: new Date().toISOString() } : a)))
    })
  }

  return (
    <div className="space-y-5">
      {/* Door staff gets the wider column: its assign form carries three
          fields plus a button, while Live activity is a couple of figures. */}
      <div className="grid gap-5 print:hidden lg:grid-cols-[1.7fr_1fr]">
      <div className="space-y-5">
        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Door staff</p>
        {/* Assign form */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <UserPlus className="h-4 w-4" /> Assign a scanning attendant
          </h2>
          {/* Wraps rather than crushing: Door and Valid-for are fixed widths,
              so without this every pixel of shortfall came out of the name
              field, which is the one holding free text. */}
          <form onSubmit={submitAssign} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="min-w-[180px] flex-1">
              <label className="text-xs font-medium text-gray-500">Attendant name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Asha Mwakalinga"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              />
            </div>
            <div className="w-full sm:w-40">
              <label className="text-xs font-medium text-gray-500">Door</label>
              <input
                value={door}
                onChange={(e) => setDoor(e.target.value)}
                placeholder="Main Gate"
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              />
            </div>
            <div className="w-full sm:w-44">
              <label className="text-xs font-medium text-gray-500">Valid for</label>
              <select
                value={validity}
                onChange={(e) => setValidity(e.target.value as AccessCodeValidity)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-400"
              >
                {ACCESS_CODE_VALIDITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={!name.trim() || pending}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
            </button>
          </form>
          {error ? <p className="mt-2 text-xs text-rose-600">{error}</p> : null}

          {reveal ? (
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-sm font-medium text-emerald-900">
                {reveal.attendantName}&apos;s access — shown once, won&apos;t be shown again
              </p>
              {/* Whoever hands this over needs to know when it dies, or
                  they'll find out at the door. */}
              <p className="mt-0.5 text-xs text-emerald-800">
                Works until{' '}
                {new Date(reveal.expiresAt).toLocaleString(undefined, {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  {/* Short enough now to show in full at a readable size —
                      an attendant types this by hand at the door. */}
                  <code className="flex-1 rounded-md border border-emerald-200 bg-white px-3 py-2 text-center text-lg font-semibold tracking-[0.2em] text-gray-900">
                    {formatScannerAccessCode(reveal.token)}
                  </code>
                  <button
                    onClick={() => copy(reveal.token, 'code')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                  >
                    <Copy className="h-3.5 w-3.5" /> {copied === 'code' ? 'Copied' : 'Copy code'}
                  </button>
                </div>
                {reveal.link ? (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 truncate rounded-md border border-emerald-200 bg-white px-3 py-2 text-xs text-gray-700">
                      {reveal.link}
                    </code>
                    <button
                      onClick={() => copy(reveal.link, 'link')}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                    >
                      <Copy className="h-3.5 w-3.5" /> {copied === 'link' ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                ) : (
                  <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    {reveal.linkWarning ?? 'Could not build a shareable link — share the code above manually.'}
                  </p>
                )}
              </div>
              <p className="mt-2 text-xs text-emerald-700">
                Share the link directly (e.g. via WhatsApp), or read the code aloud if they&apos;ll type it into the
                scanner&apos;s home screen.
              </p>
            </div>
          ) : null}
        </div>

        {/* Attendant list — usable codes lead; spent ones are kept for audit
            but tucked behind a disclosure so they can't be mistaken for
            someone who can currently open a door. */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">
              {/* Counts only usable codes: "2" meaning one live and one revoked
                  reads as two people who can scan, which isn't true. */}
              Active codes{usable.length > 0 ? ` (${usable.length})` : ''}
            </span>
            {spent.length > 0 ? (
              <button
                onClick={() => setShowSpent((v) => !v)}
                aria-expanded={showSpent}
                className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                {showSpent ? 'Hide' : 'Show'} {spent.length} past{' '}
                {spent.length === 1 ? 'code' : 'codes'}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showSpent ? 'rotate-180' : ''}`} />
              </button>
            ) : null}
          </div>

          {attendants.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <UserRoundX className="h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-500">No admin-assigned attendants yet.</p>
              <p className="text-xs text-gray-400">Use the form above to assign someone a door and a code.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {usable.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-500">
                  No active codes — nobody can scan at this door right now.
                </p>
              ) : (
                usable.map((a) => (
                  <AttendantRow
                    key={a.id}
                    attendant={a}
                    nowMs={nowMs}
                    pending={pending}
                    onRevoke={() => revoke(a.id)}
                    onReassign={() => reassign(a)}
                  />
                ))
              )}

              {showSpent
                ? spent.map((a) => (
                    <AttendantRow
                      key={a.id}
                      attendant={a}
                      nowMs={nowMs}
                      pending={pending}
                      muted
                      onRevoke={() => revoke(a.id)}
                      onReassign={() => reassign(a)}
                    />
                  ))
                : null}
            </div>
          )}
        </div>
      </div>

      {/* Live attendance */}
      <div className="space-y-5">
        <p className="text-xs font-semibold tracking-wide text-gray-400 uppercase">Live activity</p>
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-gray-300'}`} />
            {connected ? 'Live' : 'Showing last known counts'}
          </p>
          <p className="mt-2 text-sm text-gray-500">Checked in</p>
          <p className="mt-1 text-4xl font-bold tabular-nums text-gray-900">
            {checkedIn} <span className="text-lg font-medium text-gray-400">/ {baseline.totalAttending}</span>
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full rounded-full bg-gray-900 transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
            <DoorOpen className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-medium tracking-wide text-gray-500 uppercase">Recent arrivals</span>
          </div>
          {feed.length === 0 ? (
            <div className="flex flex-col items-center gap-2 p-8 text-center">
              <ShieldCheck className="h-6 w-6 text-gray-300" />
              <p className="text-sm text-gray-500">No guests checked in yet.</p>
              <p className="text-xs text-gray-400">Arrivals will appear here the moment a scan comes in.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {feed.map((f, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-2.5 text-sm">
                  <span className="text-gray-900">{f.guestName}</span>
                  <span className="text-xs text-gray-500">
                    {f.duplicate ? 'duplicate scan · ' : ''}
                    {f.doorLabel ?? 'Door'} · {formatTime(f.checkedInAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
