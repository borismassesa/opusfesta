'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarDays, QrCode, Ticket, Users2 } from 'lucide-react'
import { useSetPageHeading } from '@/components/PageHeading'
import { cn } from '@/lib/utils'
import CheckinEventClient, { type CheckinBaseline } from './CheckinEventClient'
import TicketGenerationClient from './TicketGenerationClient'
import type { AttendantAssignment } from '../actions'

type ConsoleTab = 'checkin' | 'tickets'

function formatEventDate(iso: string | null) {
  if (!iso) return 'No date set'
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
}

export default function EventConsoleClient({
  eventId,
  baseline,
  initialAttendants,
  initialTab,
  canCheckin,
  canTickets,
}: {
  eventId: string
  baseline: CheckinBaseline
  initialAttendants: AttendantAssignment[]
  initialTab: ConsoleTab
  canCheckin: boolean
  canTickets: boolean
}) {
  const router = useRouter()
  const [tab, setTab] = useState<ConsoleTab>(initialTab)

  useSetPageHeading({
    title: baseline.event?.name ?? 'Event',
    back: { href: '/operations/checkin', label: tab === 'tickets' ? 'Ticket Generation' : 'Event Check-in' },
  })

  function selectTab(next: ConsoleTab) {
    setTab(next)
    // Keep the URL in sync so refresh/share/back preserves which tab was open.
    router.replace(next === 'tickets' ? `/operations/checkin/${eventId}?tab=tickets` : `/operations/checkin/${eventId}`, {
      scroll: false,
    })
  }

  return (
    // Padding comes from operations/layout.tsx — adding p-6 here stacked on
    // top of it, pushing the content 24px in and down from the page header.
    <div className="space-y-5">
      {/* Event header — the global page header hides the event name while
          "back" mode is active, so without this the admin has no on-page
          confirmation of which event they're managing. */}
      <div className="print:hidden">
        <h1 className="text-xl font-bold text-gray-900">{baseline.event?.name ?? 'Event'}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
          {baseline.event?.eventType ? <span className="capitalize">{baseline.event.eventType.replace(/_/g, ' ')}</span> : null}
          {baseline.event?.coupleName ? (
            <span className="flex items-center gap-1">
              <Users2 className="h-3.5 w-3.5" /> {baseline.event.coupleName}
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" /> {formatEventDate(baseline.event?.startsAt ?? null)}
          </span>
        </div>
      </div>

      {canCheckin && canTickets ? (
        <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1 print:hidden w-fit">
          <button
            type="button"
            onClick={() => selectTab('checkin')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'checkin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <QrCode className="h-3.5 w-3.5" /> Door staff &amp; check-in
          </button>
          <button
            type="button"
            onClick={() => selectTab('tickets')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors',
              tab === 'tickets' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            <Ticket className="h-3.5 w-3.5" /> Ticket generation
          </button>
        </div>
      ) : null}

      {tab === 'checkin' && canCheckin ? (
        <CheckinEventClient eventId={eventId} baseline={baseline} initialAttendants={initialAttendants} />
      ) : null}
      {tab === 'tickets' && canTickets ? <TicketGenerationClient eventId={eventId} /> : null}
    </div>
  )
}
