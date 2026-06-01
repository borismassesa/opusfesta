import Link from 'next/link'
import { Armchair, CalendarPlus } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { getEvents } from '@/lib/dashboard/queries'

export const dynamic = 'force-dynamic'

export default async function SeatingPage() {
  const events = await getEvents()
  const hasEvents = events.length > 0

  return (
    <div className="space-y-6">
      <header className="border-b border-black/[0.06] pb-6">
        <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
          Seat collection
        </h1>
        <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">
          Build a seating plan for each event, assign guests to tables, and share a tidy
          arrangement with your venue.
        </p>
      </header>

      {hasEvents ? (
        <EmptyState
          icon={<Armchair className="h-7 w-7" />}
          title="Seating planner coming soon"
          description="Your events are ready. Soon you'll be able to lay out tables and drag guests from your list into seats."
        />
      ) : (
        <EmptyState
          icon={<CalendarPlus className="h-7 w-7" />}
          title="Add an event first"
          description="Seating is organised per event, so start by creating one. Once you have an event and guests, you can plan the tables here."
          action={
            <Link href="/my/dashboard/events">
              <Button>
                <CalendarPlus className="h-4 w-4" /> Create an event
              </Button>
            </Link>
          }
        />
      )}
    </div>
  )
}
