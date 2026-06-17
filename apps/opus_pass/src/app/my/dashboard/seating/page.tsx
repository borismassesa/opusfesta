import Link from 'next/link'
import { CalendarPlus } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { getEvents, getSeatingData } from '@/lib/dashboard/queries'
import SeatingPlanner from './SeatingPlanner'

export const dynamic = 'force-dynamic'

export default async function SeatingPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string }>
}) {
  const { event: eventParam } = await searchParams
  const events = await getEvents()

  if (events.length === 0) {
    return (
      <div className="space-y-6">
        <Header />
        <EmptyState
          icon={<CalendarPlus className="h-7 w-7" />}
          title="Add an event first"
          description="Seating is organised per event, so start by creating one. Once you have an event and guests have RSVP'd, you can plan the tables here."
          action={
            <Link href="/my/dashboard/events">
              <Button>
                <CalendarPlus className="h-4 w-4" /> Create an event
              </Button>
            </Link>
          }
        />
      </div>
    )
  }

  // Pick the requested event, falling back to the first one.
  const selectedId = events.find((e) => e.id === eventParam)?.id ?? events[0].id
  const seating = await getSeatingData(selectedId)

  return (
    <div className="space-y-6">
      <Header />
      {seating ? (
        <SeatingPlanner
          events={events.map((e) => ({ id: e.id, name: e.name }))}
          data={seating}
        />
      ) : (
        <EmptyState title="Event not found" description="Pick a different event from your list." />
      )}
    </div>
  )
}

function Header() {
  return (
    <header className="border-b border-black/[0.06] pb-6">
      <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
        Seat collection
      </h1>
      <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">
        Build a seating plan for each event, assign guests to tables, and share a tidy
        arrangement with your venue.
      </p>
    </header>
  )
}
