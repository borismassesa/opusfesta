'use client'

import { useMemo, useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Download, ClipboardCheck, Utensils, Search, Flag, Check, X } from 'lucide-react'
import { Card, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { inputClass } from '@/components/dashboard/controls'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { cn } from '@/lib/utils'
import { updateRsvp, approveReviewGuest, dismissReviewGuest } from '@/lib/dashboard/actions'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type { RsvpsDashboardCopy } from '@/lib/cms/dashboard-copy'
import {
  RSVP_STATUS_LABELS,
  type GuestSource,
  type GuestWithInvitations,
  type LastSend,
  type RsvpStatus,
  type SendChannel,
  type WeddingEvent,
} from '@/lib/dashboard/types'

const STATUSES: RsvpStatus[] = ['attending', 'maybe', 'declined', 'pending']

type StatusFilter = 'all' | RsvpStatus | 'review'

interface Row {
  invitationId: string
  guestId: string
  guestName: string
  group: string | null
  eventId: string
  eventName: string
  status: RsvpStatus
  partySize: number
  meal: string | null
  dietary: string | null
  message: string | null
  respondedAt: string | null
  source: GuestSource
  lastSend: LastSend | null
}

const CHANNEL_LABELS: Record<SendChannel, string> = {
  whatsapp: 'WhatsApp',
  sms: 'SMS',
  email: 'Email',
  link: 'Link',
}

const CHANNEL_DOT: Record<SendChannel, string> = {
  whatsapp: 'bg-[#25D366]',
  sms: 'bg-[#3478F6]',
  email: 'bg-[#E0A458]',
  link: 'bg-[#C9A0DC]',
}

/** Compact "2d ago" style relative time. Client-only (uses the wall clock). */
function relTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 0) return 'just now'
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min}m ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}h ago`
  const d = Math.floor(hr / 24)
  if (d === 1) return 'yesterday'
  if (d < 30) return `${d}d ago`
  const w = Math.floor(d / 7)
  if (d < 60) return `${w}w ago`
  return `${Math.floor(d / 30)}mo ago`
}

export default function RsvpTracker({
  guests,
  events,
  lastSend,
  hero,
  copy,
}: {
  guests: GuestWithInvitations[]
  events: WeddingEvent[]
  lastSend: Record<string, LastSend>
  hero: DashboardHeroContent
  copy: RsvpsDashboardCopy
}) {
  const [eventFilter, setEventFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [query, setQuery] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const tableRef = useRef<HTMLDivElement>(null)

  const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? 'Event'

  // Self-RSVPs from the public link sit in a review bucket until the host
  // approves them, so they're tracked separately and never counted in totals.
  const reviewGuests = useMemo(
    () => guests.filter((g) => g.review_status === 'unconfirmed'),
    [guests],
  )
  const confirmedGuests = useMemo(
    () => guests.filter((g) => g.review_status !== 'unconfirmed'),
    [guests],
  )

  // One row per confirmed invitation (a guest invited to N events → N rows).
  const confirmedRows: Row[] = useMemo(
    () =>
      confirmedGuests.flatMap((g) =>
        g.invitations.map((inv) => ({
          invitationId: inv.id,
          guestId: g.id,
          guestName: g.full_name,
          group: g.group_tag,
          eventId: inv.event_id,
          eventName: eventName(inv.event_id),
          status: inv.rsvp_status,
          partySize: inv.party_size,
          meal: inv.meal_choice,
          dietary: inv.dietary_notes,
          message: inv.guest_message,
          respondedAt: inv.responded_at,
          source: g.source,
          lastSend: lastSend[g.id] ?? null,
        })),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [confirmedGuests, events, lastSend],
  )

  // One row per review guest (their self-RSVP is identical across events, so we
  // collapse to a single representative row — attending if they're coming).
  const reviewRows: Row[] = useMemo(
    () =>
      reviewGuests.map((g) => {
        const inv =
          g.invitations.find((i) => i.rsvp_status === 'attending') ?? g.invitations[0]
        return {
          invitationId: inv?.id ?? g.id,
          guestId: g.id,
          guestName: g.full_name,
          group: g.group_tag,
          eventId: inv?.event_id ?? 'all',
          eventName: inv ? eventName(inv.event_id) : '',
          status: inv?.rsvp_status ?? 'pending',
          partySize: inv?.party_size ?? 1,
          meal: inv?.meal_choice ?? null,
          dietary: inv?.dietary_notes ?? null,
          message: inv?.guest_message ?? null,
          respondedAt: inv?.responded_at ?? g.created_at,
          source: g.source,
          lastSend: null,
        }
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reviewGuests, events],
  )

  // Confirmed rows scoped to the chosen event — the basis for every stat.
  const scoped = useMemo(
    () => (eventFilter === 'all' ? confirmedRows : confirmedRows.filter((r) => r.eventId === eventFilter)),
    [confirmedRows, eventFilter],
  )

  const stats = useMemo(() => {
    const attendingRows = scoped.filter((r) => r.status === 'attending')
    const attendingGuests = new Set(attendingRows.map((r) => r.guestId)).size
    const headcount = attendingRows.reduce((sum, r) => sum + (r.partySize || 1), 0)
    const plusOnes = Math.max(0, headcount - attendingGuests)
    const declined = scoped.filter((r) => r.status === 'declined').length
    const maybe = scoped.filter((r) => r.status === 'maybe').length
    const pending = scoped.filter((r) => r.status === 'pending').length
    const replied = attendingRows.length + declined + maybe
    const invited = scoped.length
    return {
      attendingGuests,
      headcount,
      plusOnes,
      declined,
      maybe,
      pending,
      awaiting: pending + maybe,
      replied,
      invited,
      responseRate: invited === 0 ? 0 : Math.round((replied / invited) * 100),
    }
  }, [scoped])

  // Meal preferences — headcount per choice, among attending guests.
  const meals = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of scoped) {
      if (r.status !== 'attending' || !r.meal) continue
      map.set(r.meal, (map.get(r.meal) ?? 0) + (r.partySize || 1))
    }
    return [...map.entries()].map(([choice, count]) => ({ choice, count })).sort((a, b) => b.count - a.count)
  }, [scoped])

  // Dietary notes — flagged on RSVPs. Free text, so we group by exact wording.
  const dietary = useMemo(() => {
    const map = new Map<string, number>()
    for (const r of scoped) {
      const note = r.dietary?.trim()
      if (!note) continue
      map.set(note, (map.get(note) ?? 0) + 1)
    }
    return [...map.entries()].map(([note, count]) => ({ note, count })).sort((a, b) => b.count - a.count)
  }, [scoped])

  const counts = useMemo(
    () => ({
      all: scoped.length + reviewRows.length,
      attending: scoped.filter((r) => r.status === 'attending').length,
      declined: stats.declined,
      awaiting: stats.awaiting,
      review: reviewRows.length,
    }),
    [scoped, reviewRows.length, stats],
  )

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    const matches = (r: Row) =>
      !q || `${r.guestName} ${r.group ?? ''} ${r.meal ?? ''} ${r.dietary ?? ''}`.toLowerCase().includes(q)

    if (statusFilter === 'review') return reviewRows.filter(matches)

    const base = scoped.filter((r) => {
      if (statusFilter === 'all') return true
      if (statusFilter === 'pending') return r.status === 'pending' || r.status === 'maybe'
      return r.status === statusFilter
    })
    const list = base.filter(matches)
    // Surface self-RSVPs needing review at the top of the "all" view.
    return statusFilter === 'all' ? [...reviewRows.filter(matches), ...list] : list
  }, [scoped, reviewRows, statusFilter, query])

  const hasRows = confirmedRows.length > 0 || reviewRows.length > 0

  function changeStatus(invitationId: string, status: RsvpStatus) {
    startTransition(async () => {
      try {
        await updateRsvp(invitationId, { rsvp_status: status })
        toast.success(copy.toast_updated)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Could not update')
      }
    })
  }

  function reviewAction(guestId: string, fn: (id: string) => Promise<void>, ok: string) {
    setPendingId(guestId)
    startTransition(async () => {
      try {
        await fn(guestId)
        toast.success(ok)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setPendingId(null)
      }
    })
  }

  function goToReview() {
    setStatusFilter('review')
    tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function exportCsv() {
    const header = ['Guest', 'Group', 'Event', 'Status', 'Party size', 'Meal', 'Dietary notes', 'Message', 'Review']
    const escape = (v: string | number | null) => {
      let s = String(v ?? '')
      // Neutralize spreadsheet formula injection from free-text guest fields.
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
      return `"${s.replace(/"/g, '""')}"`
    }
    const lines = [...scoped, ...reviewRows].map((r) =>
      [
        r.guestName,
        r.group,
        r.eventName,
        RSVP_STATUS_LABELS[r.status],
        r.status === 'attending' ? r.partySize : '',
        r.meal,
        r.dietary,
        r.message,
        reviewRows.some((rr) => rr.guestId === r.guestId) ? 'Needs review' : '',
      ]
        .map(escape)
        .join(','),
    )
    const csv = [header.map(escape).join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rsvps.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        content={hero}
        actions={
          hasRows ? (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-black/[0.08]"
            >
              <Download className="h-3.5 w-3.5" /> {copy.export_cta}
            </button>
          ) : null
        }
      />

      {!hasRows ? (
        <EmptyState
          icon={<ClipboardCheck className="h-7 w-7" />}
          title={copy.empty_title}
          description={copy.empty_description}
        />
      ) : (
        <>
          {/* Event scope */}
          {events.length > 1 ? (
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-sm font-medium text-[#1A1A1A]/60" htmlFor="rsvp-event">
                Event
              </label>
              <select
                id="rsvp-event"
                className={`${inputClass} w-auto`}
                value={eventFilter}
                onChange={(e) => setEventFilter(e.target.value)}
              >
                <option value="all">{copy.filter_all_events}</option>
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {/* Self-RSVP review banner */}
          {reviewRows.length > 0 ? (
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[#C9A0DC]/60 bg-[#F0DFF6]/70 px-4 py-3.5 sm:px-5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#7E5896]">
                <Flag className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {reviewRows.length} self-RSVP{reviewRows.length === 1 ? '' : 's'} need review
                </p>
                <p className="text-xs text-[#1A1A1A]/60">
                  Replies from your public link — confirm each one before it counts toward your headcount.
                </p>
              </div>
              <button
                type="button"
                onClick={goToReview}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#7E5896] px-4 py-2 text-xs font-semibold text-white hover:bg-[#6c4a83]"
              >
                Review now
              </button>
            </div>
          ) : null}

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatTile
              dot="bg-emerald-500"
              label="Attending"
              value={stats.attendingGuests}
              hint={stats.plusOnes > 0 ? `+${stats.plusOnes} plus-one${stats.plusOnes === 1 ? '' : 's'}` : 'guests confirmed'}
            />
            <StatTile
              dot="bg-rose-500"
              label="Declined"
              value={stats.declined}
              hint={stats.replied > 0 ? `${Math.round((stats.declined / stats.replied) * 100)}% of replies` : 'No replies yet'}
            />
            <StatTile
              dot="bg-neutral-400"
              label="Awaiting reply"
              value={stats.awaiting}
              hint={stats.maybe > 0 ? `${stats.maybe} said maybe` : 'Yet to respond'}
            />
            <StatTile
              dot="bg-[#C9A0DC]"
              label="Total headcount"
              value={stats.headcount}
              hint="Seats to plan for catering"
              accent
            />
          </div>

          {/* Response rate */}
          <Card className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4">
            <p className="text-sm text-[#1A1A1A]/60">
              <b className="text-[#1A1A1A]">{stats.replied}</b> of {stats.invited} invited have replied ·{' '}
              <b className="text-[#1A1A1A]">{stats.responseRate}%</b> response rate
            </p>
            <div className="flex h-2.5 min-w-[160px] flex-1 overflow-hidden rounded-full bg-black/[0.06]">
              <span className="bg-emerald-500" style={{ width: `${pct(counts.attending, stats.invited)}%` }} />
              <span className="bg-rose-500" style={{ width: `${pct(stats.declined, stats.invited)}%` }} />
              <span className="bg-[#C9A0DC]" style={{ width: `${pct(stats.awaiting, stats.invited)}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#1A1A1A]/55">
              <Legend dot="bg-emerald-500" label="Attending" />
              <Legend dot="bg-rose-500" label="Declined" />
              <Legend dot="bg-[#C9A0DC]" label="Awaiting" />
            </div>
          </Card>

          {/* Meals & dietary */}
          {meals.length > 0 || dietary.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-[1.4fr_1fr]">
              <Card className="p-5">
                <h2 className="text-base font-semibold text-[#1A1A1A]">Meal preferences</h2>
                <p className="mb-4 mt-0.5 text-xs text-[#1A1A1A]/55">
                  From guests who are attending — share this with your caterer.
                </p>
                {meals.length === 0 ? (
                  <p className="text-sm text-[#1A1A1A]/45">No meal choices collected yet.</p>
                ) : (
                  <div className="space-y-3">
                    {meals.map((m) => (
                      <div key={m.choice} className="flex items-center gap-3">
                        <span className="w-32 shrink-0 truncate text-sm font-medium text-[#1A1A1A]" title={m.choice}>
                          {m.choice}
                        </span>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-black/[0.06]">
                          <span
                            className="block h-full rounded-full bg-[#C9A0DC]"
                            style={{ width: `${pct(m.count, meals[0].count)}%` }}
                          />
                        </div>
                        <span className="w-8 shrink-0 text-right text-sm font-semibold tabular-nums text-[#1A1A1A]/65">
                          {m.count}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
              <Card className="p-5">
                <h2 className="text-base font-semibold text-[#1A1A1A]">Dietary notes</h2>
                <p className="mb-4 mt-0.5 text-xs text-[#1A1A1A]/55">Flagged by guests on their RSVP.</p>
                {dietary.length === 0 ? (
                  <p className="text-sm text-[#1A1A1A]/45">No dietary notes flagged yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {dietary.map((d) => (
                      <span
                        key={d.note}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#9FE870]/35 px-3 py-1.5 text-xs font-medium text-[#3f6b1f]"
                      >
                        {d.note} <b className="text-[#2f5417]">{d.count}</b>
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : null}

          {/* Filters + search */}
          <div ref={tableRef} className="flex flex-wrap items-center gap-2">
            <FilterChip label="All" count={counts.all} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} />
            <FilterChip
              label={RSVP_STATUS_LABELS.attending}
              count={counts.attending}
              active={statusFilter === 'attending'}
              onClick={() => setStatusFilter('attending')}
            />
            <FilterChip
              label={RSVP_STATUS_LABELS.declined}
              count={counts.declined}
              active={statusFilter === 'declined'}
              onClick={() => setStatusFilter('declined')}
            />
            <FilterChip
              label="Awaiting"
              count={counts.awaiting}
              active={statusFilter === 'pending'}
              onClick={() => setStatusFilter('pending')}
            />
            {counts.review > 0 ? (
              <FilterChip
                label="Needs review"
                count={counts.review}
                active={statusFilter === 'review'}
                onClick={() => setStatusFilter('review')}
                amber
              />
            ) : null}
            <div className="relative ml-auto min-w-[200px] flex-1 sm:flex-none">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search_placeholder}
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          {/* Live reply table */}
          {visibleRows.length === 0 ? (
            <EmptyState title={copy.no_match_title} />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#1A1A1A]/45">
                    <th className="px-4 py-3 font-medium">{copy.th_guest}</th>
                    <th className="px-4 py-3 font-medium">Response</th>
                    <th className="px-4 py-3 font-medium">{copy.th_party}</th>
                    <th className="px-4 py-3 font-medium">{copy.th_meal}</th>
                    <th className="px-4 py-3 font-medium">Dietary</th>
                    <th className="px-4 py-3 font-medium">Replied via</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {visibleRows.map((r) => {
                    const isReview = reviewRows.some((rr) => rr.guestId === r.guestId)
                    return (
                      <tr key={`${r.guestId}-${r.invitationId}`} className={cn('align-top', isReview && 'bg-[#FFFBEB]')}>
                        <td className="px-4 py-3.5">
                          <p className="flex items-center gap-1.5 font-medium text-[#1A1A1A]">
                            {r.guestName}
                            {isReview ? <Flag className="h-3 w-3 text-[#8a6d1a]" /> : null}
                          </p>
                          {isReview ? (
                            <p className="text-xs text-[#8a6d1a]">Self-RSVP from public link</p>
                          ) : r.group ? (
                            <p className="text-xs text-[#1A1A1A]/45">{r.group}</p>
                          ) : null}
                          {!isReview && eventFilter === 'all' ? (
                            <p className="text-xs text-[#1A1A1A]/40">{r.eventName}</p>
                          ) : null}
                          {r.message ? (
                            <p className="mt-1 max-w-[220px] text-xs italic text-[#1A1A1A]/50">“{r.message}”</p>
                          ) : null}
                        </td>
                        <td className="px-4 py-3.5">
                          {isReview ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-medium text-[#8a6d1a] ring-1 ring-inset ring-[#FBE8B0]">
                              Needs review
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              <StatusPill status={r.status} />
                              <select
                                value={r.status}
                                disabled={pending}
                                onChange={(e) => changeStatus(r.invitationId, e.target.value as RsvpStatus)}
                                className="rounded-lg border border-black/[0.1] bg-white px-2 py-1 text-xs text-[#1A1A1A]/70 outline-none focus:border-[#C9A0DC]"
                              >
                                {STATUSES.map((s) => (
                                  <option key={s} value={s}>
                                    {RSVP_STATUS_LABELS[s]}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[#1A1A1A]/70">
                          {r.status === 'attending' ? r.partySize : '—'}
                        </td>
                        <td className="px-4 py-3.5 text-[#1A1A1A]/70">
                          {r.meal ? (
                            <span className="inline-flex items-center gap-1">
                              <Utensils className="h-3.5 w-3.5 text-[#1A1A1A]/35" /> {r.meal}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-[#1A1A1A]/70">
                          {r.dietary ? <span className="text-xs">{r.dietary}</span> : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          {isReview ? (
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                disabled={pendingId === r.guestId}
                                onClick={() => reviewAction(r.guestId, approveReviewGuest, 'Guest confirmed')}
                                className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              >
                                <Check className="h-3.5 w-3.5" /> Confirm
                              </button>
                              <button
                                type="button"
                                disabled={pendingId === r.guestId}
                                onClick={() => reviewAction(r.guestId, dismissReviewGuest, 'Self-RSVP dismissed')}
                                className="inline-flex items-center gap-1 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-semibold text-[#1A1A1A]/60 hover:bg-black/[0.07] disabled:opacity-50"
                              >
                                <X className="h-3.5 w-3.5" /> Dismiss
                              </button>
                            </div>
                          ) : (
                            <ReplyVia row={r} />
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function pct(part: number, whole: number): number {
  if (whole <= 0) return 0
  return Math.round((part / whole) * 100)
}

function StatTile({
  dot,
  label,
  value,
  hint,
  accent,
}: {
  dot: string
  label: string
  value: number
  hint: string
  accent?: boolean
}) {
  return (
    <Card className={cn('p-4', accent && 'bg-gradient-to-br from-[#F0DFF6]/70 to-white')}>
      <div className="flex items-center gap-2">
        <span className={cn('h-2 w-2 rounded-full', dot)} />
        <span className="text-[11px] font-medium uppercase tracking-wide text-[#1A1A1A]/55">{label}</span>
      </div>
      <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-[#1A1A1A]">{value}</p>
      <p className="mt-1.5 text-xs text-[#1A1A1A]/50">{hint}</p>
    </Card>
  )
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', dot)} /> {label}
    </span>
  )
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  amber,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
  amber?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors',
        active
          ? amber
            ? 'bg-[#FFFBEB] text-[#8a6d1a] ring-1 ring-inset ring-[#FBE8B0]'
            : 'bg-[#F0DFF6] text-[#5d3a78]'
          : 'text-[#1A1A1A]/55 hover:bg-black/[0.04]',
      )}
    >
      {label}
      <span className={cn('tabular-nums', active ? 'opacity-100' : 'text-[#1A1A1A]/35')}>{count}</span>
    </button>
  )
}

function ReplyVia({ row }: { row: Row }) {
  if (row.source === 'public') {
    return <ChannelLine dot="bg-[#C9A0DC]" label="Public link" time={relTime(row.respondedAt)} />
  }
  const channel = row.lastSend?.channel
  if (row.respondedAt) {
    return (
      <ChannelLine
        dot={channel ? CHANNEL_DOT[channel] : 'bg-[#1A1A1A]/25'}
        label={channel ? CHANNEL_LABELS[channel] : 'Replied'}
        time={relTime(row.respondedAt)}
      />
    )
  }
  if (row.lastSend) {
    return <ChannelLine dot={CHANNEL_DOT[row.lastSend.channel]} label="Invite sent" time={relTime(row.lastSend.at)} />
  }
  return <span className="text-xs text-[#1A1A1A]/40">Not sent yet</span>
}

function ChannelLine({ dot, label, time }: { dot: string; label: string; time: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-[#1A1A1A]/55">
      <span className={cn('h-2 w-2 rounded-full', dot)} />
      {label}
      {time ? <span className="text-[#1A1A1A]/40">· {time}</span> : null}
    </span>
  )
}
