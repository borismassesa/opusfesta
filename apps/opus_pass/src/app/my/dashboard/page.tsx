import Link from 'next/link'
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Send,
  CalendarHeart,
  Utensils,
  ArrowRight,
} from 'lucide-react'
import {
  getStats,
  getEvents,
  getGuestsWithInvitations,
  getCoupleProfile,
  coupleDisplayName,
} from '@/lib/dashboard/queries'
import { requireDashboardUser } from '@/lib/dashboard/auth'
import { createDashboardClient } from '@/lib/dashboard/supabase'
import { Card, StatCard, SectionTitle, ProgressBar, StatusPill, EmptyState } from '@/components/dashboard/primitives'
import { Button } from '@/components/dashboard/controls'
import { loadDashboardHero } from '@/lib/cms/dashboard-hero'
import { EVENT_TYPE_LABELS } from '@/lib/dashboard/types'

export const dynamic = 'force-dynamic'

async function seedStarterEventIfEmpty(): Promise<void> {
  const user = await requireDashboardUser()
  const admin = createDashboardClient()
  const { count } = await admin
    .from('wedding_events')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
  if ((count ?? 0) > 0) return
  await admin.from('wedding_events').insert({
    user_id: user.id,
    name: 'Our wedding',
    event_type: 'ceremony',
    sort_order: 0,
  })
}

function formatDate(value: string | null): string {
  if (!value) return 'Date TBC'
  return new Date(value).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

interface PageProps {
  searchParams: Promise<{ seed?: string }>
}

export default async function DashboardOverviewPage({ searchParams }: PageProps) {
  const { seed } = await searchParams
  if (seed === '1') await seedStarterEventIfEmpty()

  const [stats, events, guests, profile, hero] = await Promise.all([
    getStats(),
    getEvents(),
    getGuestsWithInvitations(),
    getCoupleProfile(),
    loadDashboardHero('home'),
  ])

  const upcoming = events
    .filter((e) => e.starts_at && new Date(e.starts_at) >= new Date(new Date().toDateString()))
    .slice(0, 3)

  const recent = guests
    .flatMap((g) => g.invitations.map((inv) => ({ guest: g, inv })))
    .filter((x) => x.inv.responded_at)
    .sort((a, b) => new Date(b.inv.responded_at!).getTime() - new Date(a.inv.responded_at!).getTime())
    .slice(0, 6)

  const empty = stats.totalGuests === 0 && events.length === 0

  const coupleName = coupleDisplayName(profile)
  const headerTitle = coupleName === 'The Couple' ? hero.title : `Welcome back, ${coupleName}`

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-black/[0.06] pb-6">
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A] sm:text-3xl">
            {headerTitle}
          </h1>
          {hero.subtitle ? (
            <p className="mt-2 text-sm text-[#1A1A1A]/65 sm:text-base">{hero.subtitle}</p>
          ) : null}
        </div>
        <Link href="/my/dashboard/guests">
          <Button>
            <Users className="h-4 w-4" /> Manage guests
          </Button>
        </Link>
      </header>

      {empty ? (
        <EmptyState
          icon={<CalendarHeart className="h-7 w-7" />}
          title="Let's set up your celebration"
          description="Add your events, then build your guest list and start sending invitations. Track every RSVP in one place."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link href="/my/dashboard/events">
                <Button>
                  <CalendarHeart className="h-4 w-4" /> Add an event
                </Button>
              </Link>
              <Link href="/my/dashboard/guests">
                <Button variant="secondary">
                  <Users className="h-4 w-4" /> Add guests
                </Button>
              </Link>
            </div>
          }
        />
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Guests" value={stats.totalGuests} icon={<Users className="h-5 w-5" />} accent />
            <StatCard
              label="Attending"
              value={stats.attending}
              hint={`${stats.expectedHeadcount} expected to attend`}
              icon={<UserCheck className="h-5 w-5" />}
            />
            <StatCard label="Declined" value={stats.declined} icon={<UserX className="h-5 w-5" />} />
            <StatCard label="Awaiting reply" value={stats.pending} icon={<Clock className="h-5 w-5" />} />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Response rate + funnel */}
            <Card className="p-6 lg:col-span-2">
              <SectionTitle title="Response progress" subtitle={`${stats.responseRate}% of invitations answered`} />
              <ProgressBar value={stats.responseRate} />
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                  { label: 'Attending', value: stats.attending, dot: 'bg-emerald-500' },
                  { label: 'Maybe', value: stats.maybe, dot: 'bg-amber-500' },
                  { label: 'Declined', value: stats.declined, dot: 'bg-rose-500' },
                  { label: 'Awaiting', value: stats.pending, dot: 'bg-neutral-400' },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      <span className="text-xs text-[#1A1A1A]/55">{s.label}</span>
                    </div>
                    <p className="mt-1 text-xl font-bold text-[#1A1A1A]">{s.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* Meal breakdown */}
            <Card className="p-6">
              <SectionTitle title="Meal choices" />
              {stats.mealBreakdown.length === 0 ? (
                <p className="flex items-center gap-2 text-sm text-[#1A1A1A]/45">
                  <Utensils className="h-4 w-4" /> No meal preferences yet
                </p>
              ) : (
                <ul className="space-y-3">
                  {stats.mealBreakdown.map((m) => (
                    <li key={m.choice} className="flex items-center justify-between text-sm">
                      <span className="text-[#1A1A1A]/70">{m.choice}</span>
                      <span className="font-semibold text-[#1A1A1A]">{m.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Upcoming events */}
            <div>
              <SectionTitle
                title="Upcoming events"
                action={
                  <Link href="/my/dashboard/events" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:underline">
                    View all
                  </Link>
                }
              />
              {upcoming.length === 0 ? (
                <EmptyState
                  icon={<CalendarHeart className="h-6 w-6" />}
                  title="No upcoming events"
                  action={
                    <Link href="/my/dashboard/events">
                      <Button variant="secondary">Add an event</Button>
                    </Link>
                  }
                />
              ) : (
                <div className="space-y-3">
                  {upcoming.map((e) => (
                    <Card key={e.id} className="flex items-center gap-4 p-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/[0.05] text-[#1A1A1A]/70">
                        <CalendarHeart className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-[#1A1A1A]">{e.name}</p>
                        <p className="text-xs text-[#1A1A1A]/55">
                          {EVENT_TYPE_LABELS[e.event_type]} · {formatDate(e.starts_at)}
                          {e.venue_name ? ` · ${e.venue_name}` : ''}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Recent responses */}
            <div>
              <SectionTitle
                title="Recent responses"
                action={
                  <Link href="/my/dashboard/rsvps" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#1A1A1A] hover:underline">
                    View all
                  </Link>
                }
              />
              {recent.length === 0 ? (
                <EmptyState
                  icon={<Send className="h-6 w-6" />}
                  title="No responses yet"
                  description="Send invitations to start collecting RSVPs."
                  action={
                    <Link href="/my/dashboard/invitations">
                      <Button variant="secondary">
                        <Send className="h-4 w-4" /> Send invites
                      </Button>
                    </Link>
                  }
                />
              ) : (
                <Card className="divide-y divide-black/[0.05]">
                  {recent.map(({ guest, inv }) => (
                    <div key={inv.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-[#1A1A1A]">{guest.full_name}</p>
                        {guest.group_tag ? (
                          <p className="truncate text-xs text-[#1A1A1A]/50">{guest.group_tag}</p>
                        ) : null}
                      </div>
                      <StatusPill status={inv.rsvp_status} />
                    </div>
                  ))}
                </Card>
              )}
            </div>
          </div>

          <Card className="flex flex-wrap items-center justify-between gap-4 p-6">
            <div>
              <h3 className="font-semibold text-[#1A1A1A]">Ready to invite more guests?</h3>
              <p className="text-sm text-[#1A1A1A]/55">
                Share personal RSVP links over WhatsApp, SMS or email — no app needed for guests.
              </p>
            </div>
            <Link href="/my/dashboard/invitations">
              <Button>
                Send invitations <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </Card>
        </>
      )}
    </div>
  )
}
