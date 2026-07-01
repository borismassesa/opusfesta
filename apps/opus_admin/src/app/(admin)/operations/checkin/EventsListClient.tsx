'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  CalendarCheck,
  CalendarClock,
  ChevronDown,
  QrCode,
  Search,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'

export interface CheckinEventRow {
  id: string
  name: string
  eventType: string
  startsAt: string | null
  coupleName: string
  /** Active (not revoked/expired) admin-assigned attendants. */
  activeAdminAttendants: number
  /** Active attendants from either source (admin + couple self-serve). */
  activeAttendantsTotal: number
  /** Names of active admin-assigned attendants — couple self-serve tokens
   * never persist a name server-side, so this only ever covers the admin
   * side of activeAttendantsTotal. */
  activeAdminNames: string[]
}

type TimeFilter = 'all' | 'upcoming' | 'past'
type SortMode = 'soonest' | 'latest' | 'name'

const SORT_LABELS: Record<SortMode, string> = {
  soonest: 'Date (soonest first)',
  latest: 'Date (latest first)',
  name: 'Name (A → Z)',
}

const EVENT_TYPE_TONE: Record<string, string> = {
  wedding: 'bg-[#F0DFF6] text-[#8e57b3]',
  ceremony: 'bg-[#F0DFF6] text-[#8e57b3]',
  reception: 'bg-[#FCE9C2] text-[#B07F2C]',
  send_off: 'bg-[#E8FBDB] text-[#3F8B5C]',
}

function eventTypeTone(type: string) {
  return EVENT_TYPE_TONE[type.toLowerCase().replace(/\s+/g, '_')] ?? 'bg-gray-100 text-gray-600'
}

function formatDate(iso: string | null) {
  if (!iso) return 'No date set'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function Kpi({ label, value, hint, icon }: { label: string; value: string; hint?: string; icon: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[12px] font-medium text-gray-500">{label}</div>
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </span>
      </div>
      <div className="mt-2 text-[28px] leading-none font-semibold tracking-tight text-gray-900">{value}</div>
      {hint ? <div className="mt-2 text-[11px] text-gray-400">{hint}</div> : null}
    </div>
  )
}

export default function EventsListClient({ events }: { events: CheckinEventRow[] }) {
  useSetPageHeading({ title: 'Event Check-in', subtitle: 'Assign scanning attendants and watch live arrivals' })
  const [query, setQuery] = useState('')
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('upcoming')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sort, setSort] = useState<SortMode>('soonest')
  const [sortOpen, setSortOpen] = useState(false)

  const eventTypes = useMemo(
    () => Array.from(new Set(events.map((e) => e.eventType))).sort(),
    [events],
  )

  // Used only to bucket events into upcoming/past for this render pass —
  // no SSR/hydration split to desync (this is a client-only list), so a
  // per-render snapshot is fine.
  // eslint-disable-next-line react-hooks/purity
  const now = Date.now()
  const counts = useMemo(() => {
    const upcoming = events.filter((e) => e.startsAt && new Date(e.startsAt).getTime() >= now).length
    const withAttendants = events.filter((e) => e.activeAttendantsTotal > 0).length
    const adminAssigned = events.reduce((sum, e) => sum + e.activeAdminAttendants, 0)
    return { total: events.length, upcoming, withAttendants, adminAssigned }
  }, [events, now])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    let rows = events.filter((e) => {
      if (q && !(e.name.toLowerCase().includes(q) || e.coupleName.toLowerCase().includes(q) || e.eventType.toLowerCase().includes(q))) {
        return false
      }
      if (typeFilter !== 'all' && e.eventType !== typeFilter) return false
      if (timeFilter === 'upcoming' && !(e.startsAt && new Date(e.startsAt).getTime() >= now)) return false
      if (timeFilter === 'past' && !(e.startsAt && new Date(e.startsAt).getTime() < now)) return false
      return true
    })

    rows = [...rows].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name)
      const aTime = a.startsAt ? new Date(a.startsAt).getTime() : -Infinity
      const bTime = b.startsAt ? new Date(b.startsAt).getTime() : -Infinity
      return sort === 'soonest' ? aTime - bTime : bTime - aTime
    })
    return rows
  }, [events, query, typeFilter, timeFilter, sort, now])

  return (
    <div className="space-y-5 px-8 pt-4 pb-12">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Total events" value={String(counts.total)} icon={<CalendarCheck className="h-4 w-4" />} />
        <Kpi label="Upcoming" value={String(counts.upcoming)} hint="events not yet held" icon={<CalendarClock className="h-4 w-4" />} />
        <Kpi
          label="Staffed with a scanner"
          value={String(counts.withAttendants)}
          hint="have at least one active attendant"
          icon={<UserCheck className="h-4 w-4" />}
        />
        <Kpi
          label="Admin-assigned attendants"
          value={String(counts.adminAssigned)}
          hint="active right now, across all events"
          icon={<Sparkles className="h-4 w-4" />}
        />
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by event, couple, or type…"
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pr-3 pl-9 text-sm text-gray-900 outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </div>

          <div className="flex items-center gap-1 rounded-lg bg-gray-100 p-1">
            {(['upcoming', 'past', 'all'] as TimeFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setTimeFilter(f)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors',
                  timeFilter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600 capitalize outline-none focus:border-gray-400"
          >
            <option value="all">All event types</option>
            {eventTypes.map((t) => (
              <option key={t} value={t} className="capitalize">
                {t.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          <div className="relative">
            <button
              onClick={() => setSortOpen((v) => !v)}
              onBlur={() => setTimeout(() => setSortOpen(false), 120)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-medium text-gray-600 hover:border-gray-300"
            >
              {SORT_LABELS[sort]}
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {sortOpen ? (
              <div className="absolute top-full right-0 z-10 mt-1 w-52 overflow-hidden rounded-lg border border-gray-100 bg-white py-1 shadow-lg">
                {(Object.keys(SORT_LABELS) as SortMode[]).map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => setSort(s)}
                    className={cn(
                      'block w-full px-3 py-2 text-left text-xs',
                      sort === s ? 'bg-gray-50 font-semibold text-gray-900' : 'text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {SORT_LABELS[s]}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_130px_170px_140px] items-center gap-4 border-b border-gray-100 bg-gray-50/70 px-5 py-2.5 text-[11px] font-semibold tracking-wide text-gray-500 uppercase">
          <span>Event</span>
          <span>Couple</span>
          <span>Date</span>
          <span>Scanning staff</span>
          <span></span>
        </div>
        {filtered.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-500">No events match your filters.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((e) => (
              <div
                key={e.id}
                className="grid grid-cols-[minmax(0,2.2fr)_minmax(0,1.6fr)_130px_170px_140px] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-gray-50/60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase',
                      eventTypeTone(e.eventType),
                    )}
                  >
                    {e.name.slice(0, 1)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900">{e.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{e.eventType.replace(/_/g, ' ')}</p>
                  </div>
                </div>
                <p className="truncate text-sm text-gray-700">{e.coupleName}</p>
                <p className="text-sm text-gray-500">{formatDate(e.startsAt)}</p>
                <div className="min-w-0">
                  {e.activeAttendantsTotal > 0 ? (
                    <span
                      title={e.activeAdminNames.length > 0 ? e.activeAdminNames.join(', ') : undefined}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#E8FBDB] px-2.5 py-1 text-xs font-semibold text-[#3F8B5C]"
                    >
                      <Users className="h-3 w-3 shrink-0" />
                      <span className="truncate">
                        {e.activeAdminNames.length > 0 ? e.activeAdminNames.join(', ') : `${e.activeAttendantsTotal} active`}
                      </span>
                      {/* Active attendants beyond the named ones are couple
                          self-serve tokens — no name is stored for those. */}
                      {e.activeAttendantsTotal > e.activeAdminNames.length ? (
                        <span className="shrink-0 text-[#3F8B5C]/70">
                          +{e.activeAttendantsTotal - e.activeAdminNames.length}
                        </span>
                      ) : null}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                      Unstaffed
                    </span>
                  )}
                </div>
                <Link
                  href={`/operations/checkin/${e.id}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white hover:bg-black"
                >
                  <QrCode className="h-3.5 w-3.5" /> Manage
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
