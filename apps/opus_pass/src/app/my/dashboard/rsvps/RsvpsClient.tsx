'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Download } from 'lucide-react'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { Tabs, inputClass } from '@/components/dashboard/controls'
import { setActiveEventCookie } from '@/components/dashboard/EventScope'
import { cn } from '@/lib/utils'
import RsvpSetupPanel from './RsvpSetupPanel'
import RsvpTracker from './RsvpTracker'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type { RsvpsDashboardCopy } from '@/lib/cms/dashboard-copy'
import type { MyPublicInvite, RsvpEventSummary, RsvpAnswerSummary } from '@/lib/dashboard/queries'
import {
  RSVP_STATUS_LABELS,
  type GuestWithInvitations,
  type LastSend,
  type RsvpQuestion,
  type WeddingEvent,
} from '@/lib/dashboard/types'

type Tab = 'setup' | 'responses'

/** CSV-safe cell: quote, escape quotes, and neutralize spreadsheet formulas. */
function csvCell(value: string | number | null): string {
  let s = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`
  return `"${s.replace(/"/g, '""')}"`
}

export default function RsvpsClient({
  guests,
  events,
  initialEventFilter,
  lastSend,
  hero,
  copy,
  questions,
  summaries,
  answerSummaries,
  publicInvite,
}: {
  guests: GuestWithInvitations[]
  events: WeddingEvent[]
  /** Event id chosen on the event chooser, or 'all' for the combined view. */
  initialEventFilter: string
  lastSend: Record<string, LastSend>
  hero: DashboardHeroContent
  copy: RsvpsDashboardCopy
  questions: RsvpQuestion[]
  summaries: RsvpEventSummary[]
  answerSummaries: Record<string, RsvpAnswerSummary>
  publicInvite: MyPublicInvite
}) {
  const [tab, setTab] = useState<Tab>('setup')
  const [eventFilter, setEventFilter] = useState(initialEventFilter)

  function handleEventFilterChange(id: string) {
    // Filtering is client-side; the cookie keeps the choice consistent
    // with the other event-scoped sections.
    setActiveEventCookie(id)
    setEventFilter(id)
  }

  const hasResponses = useMemo(
    () => guests.some((g) => g.invitations.length > 0),
    [guests],
  )

  function downloadReport() {
    const eventName = (id: string) => events.find((e) => e.id === id)?.name ?? 'Event'
    const header = ['Guest', 'Group', 'Event', 'Status', 'Party size', 'Meal', 'Dietary notes', 'Message', 'Review']
    const lines: string[] = []
    for (const g of guests) {
      if (g.invitations.length === 0) continue
      const needsReview = g.review_status === 'unconfirmed'
      for (const inv of g.invitations) {
        lines.push(
          [
            g.full_name,
            g.group_tag,
            eventName(inv.event_id),
            RSVP_STATUS_LABELS[inv.rsvp_status],
            inv.rsvp_status === 'attending' ? inv.party_size : '',
            inv.meal_choice,
            inv.dietary_notes,
            inv.guest_message,
            needsReview ? 'Needs review' : '',
          ]
            .map(csvCell)
            .join(','),
        )
      }
    }
    const csv = [header.map(csvCell).join(','), ...lines].join('\n')
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
        divider={false}
        actions={
          <>
            {hasResponses ? (
              <button
                type="button"
                onClick={downloadReport}
                className="inline-flex items-center gap-2 rounded-full bg-black/[0.05] px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-black/[0.08]"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </button>
            ) : null}
            <Link
              href="/my/dashboard/rsvps/setup"
              className="inline-flex items-center rounded-full bg-[#C9A0DC] px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#b97fd0]"
            >
              Guided setup
            </Link>
          </>
        }
      />

      <div>
        <Tabs<Tab>
          value={tab}
          onChange={setTab}
          tabs={[
            { id: 'setup', label: 'Setup & questions' },
            { id: 'responses', label: 'Responses' },
          ]}
          trailing={
            tab === 'responses' && events.length > 1 ? (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-[#1A1A1A]/60" htmlFor="rsvp-event">
                  Event
                </label>
                <span className="relative inline-flex items-center">
                  <select
                    id="rsvp-event"
                    className={cn(inputClass, 'w-auto appearance-none pr-9')}
                    value={eventFilter}
                    onChange={(e) => handleEventFilterChange(e.target.value)}
                  >
                    <option value="all">{copy.filter_all_events}</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#1A1A1A]/45" />
                </span>
              </div>
            ) : undefined
          }
        />
        {tab === 'setup' ? (
          <RsvpSetupPanel
            events={events}
            questions={questions}
            summaries={summaries}
            answerSummaries={answerSummaries}
            publicInvite={publicInvite}
          />
        ) : (
          <RsvpTracker
            guests={guests}
            events={events}
            eventFilter={eventFilter}
            lastSend={lastSend}
            copy={copy}
          />
        )}
      </div>
    </div>
  )
}
