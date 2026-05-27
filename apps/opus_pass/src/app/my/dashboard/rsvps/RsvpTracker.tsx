'use client'

import { useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Download, ClipboardCheck, Utensils } from 'lucide-react'
import { Card, SectionTitle, EmptyState, StatusPill } from '@/components/dashboard/primitives'
import { inputClass } from '@/components/dashboard/controls'
import { updateRsvp } from '@/lib/dashboard/actions'
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
}: {
  guests: GuestWithInvitations[]
  events: WeddingEvent[]
}) {
  const [eventFilter, setEventFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
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

  const filtered = rows.filter(
    (r) =>
      (eventFilter === 'all' || r.eventId === eventFilter) &&
      (statusFilter === 'all' || r.status === statusFilter)
  )

  function changeStatus(invitationId: string, status: RsvpStatus) {
    startTransition(async () => {
      try {
        await updateRsvp(invitationId, { rsvp_status: status })
        toast.success('RSVP updated')
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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle title="RSVPs" subtitle={`${filtered.length} of ${rows.length} invitations`} />
        {rows.length > 0 ? (
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#1A1A1A] ring-1 ring-inset ring-black/[0.12] hover:bg-black/[0.03]"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="h-7 w-7" />}
          title="No invitations yet"
          description="Invite guests to your events to start tracking their RSVPs here."
        />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <select
              className={`${inputClass} w-auto`}
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
            >
              <option value="all">All events</option>
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
            <select
              className={`${inputClass} w-auto`}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {RSVP_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No RSVPs match these filters" />
          ) : (
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-black/[0.06] text-xs uppercase tracking-wide text-[#1A1A1A]/45">
                    <th className="px-4 py-3 font-medium">Guest</th>
                    <th className="px-4 py-3 font-medium">Event</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Party</th>
                    <th className="px-4 py-3 font-medium">Meal / notes</th>
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
