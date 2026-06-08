'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Download, ClipboardCheck, Utensils, Search } from 'lucide-react'
import { Card, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { inputClass } from '@/components/dashboard/controls'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { updateRsvp } from '@/lib/dashboard/actions'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type { RsvpsDashboardCopy } from '@/lib/cms/dashboard-copy'
import {
  RSVP_STATUS_LABELS,
  type GuestWithInvitations,
  type RsvpStatus,
  type WeddingEvent,
} from '@/lib/dashboard/types'

const STATUSES: RsvpStatus[] = ['attending', 'maybe', 'declined', 'pending']

interface Row {
  invitationId: string
  guestName: string
  group: string | null
  eventId: string
  eventName: string
  status: RsvpStatus
  partySize: number
  meal: string | null
  dietary: string | null
  message: string | null
}

export default function RsvpTracker({
  guests,
  events,
  hero,
  copy,
}: {
  guests: GuestWithInvitations[]
  events: WeddingEvent[]
  hero: DashboardHeroContent
  copy: RsvpsDashboardCopy
}) {
  const [eventFilter, setEventFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | RsvpStatus>('all')
  const [query, setQuery] = useState('')
  const [pending, startTransition] = useTransition()

  const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? 'Event'

  const rows: Row[] = useMemo(
    () =>
      guests.flatMap((g) =>
        g.invitations.map((inv) => ({
          invitationId: inv.id,
          guestName: g.full_name,
          group: g.group_tag,
          eventId: inv.event_id,
          eventName: eventName(inv.event_id),
          status: inv.rsvp_status,
          partySize: inv.party_size,
          meal: inv.meal_choice,
          dietary: inv.dietary_notes,
          message: inv.guest_message,
        }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [guests, events]
  )

  const statusCounts = useMemo(() => {
    const eventScoped = eventFilter === 'all' ? rows : rows.filter((r) => r.eventId === eventFilter)
    const counts: Record<RsvpStatus, number> = { attending: 0, maybe: 0, declined: 0, pending: 0 }
    for (const r of eventScoped) counts[r.status] += 1
    return counts
  }, [rows, eventFilter])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter((r) => {
      if (eventFilter !== 'all' && r.eventId !== eventFilter) return false
      if (statusFilter !== 'all' && r.status !== statusFilter) return false
      if (q) {
        const hay = `${r.guestName} ${r.group ?? ''} ${r.meal ?? ''}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [rows, eventFilter, statusFilter, query])

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

  function exportCsv() {
    const header = ['Guest', 'Group', 'Event', 'Status', 'Party size', 'Meal', 'Dietary notes', 'Message']
    const escape = (v: string | number | null) => {
      let s = String(v ?? '')
      // Neutralize spreadsheet formula injection from free-text guest fields.
      if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
      return `"${s.replace(/"/g, '""')}"`
    }
    const lines = filtered.map((r) =>
      [
        r.guestName,
        r.group,
        r.eventName,
        RSVP_STATUS_LABELS[r.status],
        r.status === 'attending' ? r.partySize : '',
        r.meal,
        r.dietary,
        r.message,
      ]
        .map(escape)
        .join(',')
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
          rows.length > 0 ? (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-3.5 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-black/[0.08]"
            >
              <Download className="h-3.5 w-3.5" /> {copy.export_cta}
            </button>
          ) : null
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-7 w-7" />}
          title={copy.empty_title}
          description={copy.empty_description}
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATUSES.map((s) => {
              const active = statusFilter === s
              const dotColor =
                s === 'attending'
                  ? 'bg-emerald-500'
                  : s === 'maybe'
                    ? 'bg-amber-500'
                    : s === 'declined'
                      ? 'bg-rose-500'
                      : 'bg-neutral-400'
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(active ? 'all' : s)}
                  aria-pressed={active}
                  className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                    active
                      ? 'border-[#1A1A1A] bg-white shadow-sm'
                      : 'border-black/[0.08] bg-white/60 hover:border-black/20 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor}`} />
                    <span className="text-xs text-[#1A1A1A]/55">{RSVP_STATUS_LABELS[s]}</span>
                  </div>
                  <p className="mt-1 text-2xl font-bold tabular-nums text-[#1A1A1A]">{statusCounts[s]}</p>
                </button>
              )
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A1A1A]/35" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={copy.search_placeholder}
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
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
            {statusFilter !== 'all' || query ? (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('all')
                  setQuery('')
                }}
                className="text-xs font-semibold text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:underline"
              >
                {copy.clear_filters}
              </button>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState title={copy.no_match_title} />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#1A1A1A]/45">
                    <th className="px-4 py-3 font-medium">{copy.th_guest}</th>
                    <th className="px-4 py-3 font-medium">{copy.th_event}</th>
                    <th className="px-4 py-3 font-medium">{copy.th_status}</th>
                    <th className="px-4 py-3 font-medium">{copy.th_party}</th>
                    <th className="px-4 py-3 font-medium">{copy.th_meal}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/[0.05]">
                  {filtered.map((r) => (
                    <tr key={r.invitationId} className="align-top">
                      <td className="px-4 py-3">
                        <p className="font-medium text-[#1A1A1A]">{r.guestName}</p>
                        {r.group ? <p className="text-xs text-[#1A1A1A]/45">{r.group}</p> : null}
                        {r.message ? (
                          <p className="mt-1 max-w-[220px] text-xs italic text-[#1A1A1A]/50">“{r.message}”</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-[#1A1A1A]/70">{r.eventName}</td>
                      <td className="px-4 py-3">
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
                      </td>
                      <td className="px-4 py-3 text-[#1A1A1A]/70">
                        {r.status === 'attending' ? r.partySize : '—'}
                      </td>
                      <td className="px-4 py-3 text-[#1A1A1A]/70">
                        {r.meal ? (
                          <span className="inline-flex items-center gap-1">
                            <Utensils className="h-3.5 w-3.5 text-[#1A1A1A]/35" /> {r.meal}
                          </span>
                        ) : null}
                        {r.dietary ? <p className="text-xs text-[#1A1A1A]/45">{r.dietary}</p> : null}
                        {!r.meal && !r.dietary ? '—' : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
