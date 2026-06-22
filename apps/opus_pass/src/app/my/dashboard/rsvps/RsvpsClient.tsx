'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DashboardHero } from '@/components/dashboard/DashboardHero'
import { Tabs } from '@/components/dashboard/controls'
import RsvpSetupPanel from './RsvpSetupPanel'
import RsvpTracker from './RsvpTracker'
import type { DashboardHeroContent } from '@/lib/cms/dashboard-hero'
import type { RsvpsDashboardCopy } from '@/lib/cms/dashboard-copy'
import type { MyPublicInvite, RsvpEventSummary, RsvpAnswerSummary } from '@/lib/dashboard/queries'
import type {
  GuestWithInvitations,
  LastSend,
  RsvpQuestion,
  WeddingEvent,
} from '@/lib/dashboard/types'

type Tab = 'setup' | 'responses'

export default function RsvpsClient({
  guests,
  events,
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
  lastSend: Record<string, LastSend>
  hero: DashboardHeroContent
  copy: RsvpsDashboardCopy
  questions: RsvpQuestion[]
  summaries: RsvpEventSummary[]
  answerSummaries: Record<string, RsvpAnswerSummary>
  publicInvite: MyPublicInvite
}) {
  const [tab, setTab] = useState<Tab>('setup')

  return (
    <div className="space-y-6">
      <DashboardHero
        content={hero}
        actions={
          <Link
            href="/my/dashboard/rsvps/setup"
            className="inline-flex items-center rounded-full bg-[#C9A0DC] px-4 py-2 text-xs font-semibold text-[#1A1A1A] hover:bg-[#b97fd0]"
          >
            Guided setup
          </Link>
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
          <RsvpTracker guests={guests} events={events} lastSend={lastSend} copy={copy} />
        )}
      </div>
    </div>
  )
}
