'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CalendarDays,
  CalendarOff,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Minus,
  Plus,
  Trash2,
  Users,
  X,
} from 'lucide-react'
import {
  useOnboardingDraft,
  type AvailabilityDate,
} from '@/lib/onboarding/draft'
import { calendarBookings, type CalendarBooking } from '@/lib/mock-data'
import { cn } from '@/lib/utils'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const

type CalendarView = 'month' | 'week' | 'day'

const BOOKING_STATUS_META = {
  pending: {
    label: 'Pending',
    pillClass: 'bg-[#FCE9C2] text-[#8a5a14] border-[#F1D08F]',
    dotClass: 'bg-[#F5C77E]',
  },
  confirmed: {
    label: 'Confirmed',
    pillClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  completed: {
    label: 'Completed',
    pillClass: 'bg-gray-100 text-gray-700 border-gray-200',
    dotClass: 'bg-gray-400',
  },
} as const

// Local-time YYYY-MM-DD. Avoids the UTC offset issue that toISOString() has on
// the eastern hemisphere — Tanzania (+03:00) would otherwise see dates shift.
const formatISODate = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const monthGrid = (year: number, month: number): Date[] => {
  // Always render a 6-row grid (42 cells) so the calendar never reflows when
  // moving between short and long months.
  const firstOfMonth = new Date(year, month, 1)
  // Convert getDay() (0 = Sunday) → Monday-first offset.
  const lead = (firstOfMonth.getDay() + 6) % 7
  const start = new Date(year, month, 1 - lead)
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

const weekGrid = (anchor: Date): Date[] => {
  // Monday-anchored week containing `anchor`.
  const lead = (anchor.getDay() + 6) % 7
  const start = new Date(anchor)
  start.setDate(anchor.getDate() - lead)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export default function BookingsCalendarPage() {
  const { draft, update, hydrated } = useOnboardingDraft()

  const todayKey = useMemo(() => formatISODate(new Date()), [])
  const [view, setView] = useState<CalendarView>('month')
  const [anchor, setAnchor] = useState<Date>(() => new Date())
  const [selected, setSelected] = useState<string | null>(null)

  // Seed a couple of off-day examples on first visit so the calendar isn't
  // empty.
  useEffect(() => {
    if (!hydrated) return
    if (draft.availability.length > 0) return
    const seed = (offsetDays: number, note: string): AvailabilityDate => {
      const d = new Date()
      d.setDate(d.getDate() + offsetDays)
      return { date: formatISODate(d), status: 'unavailable', note }
    }
    update({
      availability: [seed(40, 'Personal leave'), seed(41, 'Personal leave')],
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  if (!hydrated) return <div className="p-8" aria-hidden />

  const offByDate = new Map(draft.availability.map((a) => [a.date, a]))

  const bookingsByDate = new Map<string, CalendarBooking[]>()
  for (const b of calendarBookings) {
    const arr = bookingsByDate.get(b.date) ?? []
    arr.push(b)
    bookingsByDate.set(b.date, arr)
  }

  const capacity = draft.parallelBookingCapacity || 1

  const setOffDay = (date: string, note?: string) => {
    const without = draft.availability.filter((a) => a.date !== date)
    update({
      availability: [...without, { date, status: 'unavailable', note }],
    })
  }

  const clearOffDay = (date: string) => {
    update({ availability: draft.availability.filter((a) => a.date !== date) })
  }

  const setCapacity = (n: number) => {
    update({ parallelBookingCapacity: Math.max(1, Math.min(20, Math.round(n))) })
  }

  const stepBy = (deltaUnits: number) => {
    setAnchor((prev) => {
      const next = new Date(prev)
      if (view === 'month') next.setMonth(prev.getMonth() + deltaUnits)
      else if (view === 'week') next.setDate(prev.getDate() + deltaUnits * 7)
      else next.setDate(prev.getDate() + deltaUnits)
      return next
    })
  }

  const goToToday = () => {
    const now = new Date()
    setAnchor(now)
    setSelected(formatISODate(now))
  }

  const blockNonWorkingDay = (weekdayIndex: number) => {
    const grid = monthGrid(anchor.getFullYear(), anchor.getMonth())
    const targets = grid.filter(
      (d) =>
        d.getMonth() === anchor.getMonth() && ((d.getDay() + 6) % 7) === weekdayIndex,
    )
    const without = draft.availability.filter(
      (a) => !targets.some((t) => formatISODate(t) === a.date),
    )
    const additions: AvailabilityDate[] = targets.map((t) => ({
      date: formatISODate(t),
      status: 'unavailable',
      note: `${WEEKDAY_LABELS[weekdayIndex]} closed`,
    }))
    update({ availability: [...without, ...additions] })
  }

  const headerLabel = (() => {
    if (view === 'month') {
      return `${MONTH_LABELS[anchor.getMonth()]} ${anchor.getFullYear()}`
    }
    if (view === 'week') {
      const week = weekGrid(anchor)
      const start = week[0]
      const end = week[6]
      const sameMonth = start.getMonth() === end.getMonth()
      return sameMonth
        ? `${start.getDate()} – ${end.getDate()} ${MONTH_LABELS[start.getMonth()]} ${start.getFullYear()}`
        : `${start.getDate()} ${MONTH_LABELS[start.getMonth()].slice(0, 3)} – ${end.getDate()} ${MONTH_LABELS[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`
    }
    return anchor.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  })()

  const selectedEntry = selected ? offByDate.get(selected) : undefined
  const selectedBookings = selected ? (bookingsByDate.get(selected) ?? []) : []
  const offDays = draft.availability.length
  const upcomingBookings = calendarBookings.filter((b) => b.date >= todayKey).length
  const overcapacityDays = Array.from(bookingsByDate.entries()).filter(
    ([, list]) => list.length > capacity,
  ).length

  return (
    <div className="px-8 pt-5 pb-10">
      <div className="space-y-4">
        <CapacityCard
          capacity={capacity}
          onChange={setCapacity}
          upcomingBookings={upcomingBookings}
          overcapacityDays={overcapacityDays}
        />

        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="space-y-4">
            <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => stepBy(-1)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-base font-semibold text-gray-900 tracking-tight tabular-nums px-2">
                    {headerLabel}
                  </h2>
                  <button
                    type="button"
                    onClick={() => stepBy(1)}
                    className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={goToToday}
                    className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-2.5 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    Today
                  </button>
                  <ViewToggle view={view} onChange={setView} />
                </div>
              </div>

              {view === 'month' ? (
                <MonthView
                  anchor={anchor}
                  todayKey={todayKey}
                  selected={selected}
                  offByDate={offByDate}
                  bookingsByDate={bookingsByDate}
                  capacity={capacity}
                  onSelect={setSelected}
                  onWeekdayClick={blockNonWorkingDay}
                />
              ) : view === 'week' ? (
                <WeekView
                  anchor={anchor}
                  todayKey={todayKey}
                  selected={selected}
                  offByDate={offByDate}
                  bookingsByDate={bookingsByDate}
                  capacity={capacity}
                  onSelect={setSelected}
                />
              ) : (
                <DayView
                  anchor={anchor}
                  todayKey={todayKey}
                  offByDate={offByDate}
                  bookings={bookingsByDate.get(formatISODate(anchor)) ?? []}
                  capacity={capacity}
                  onSelect={setSelected}
                />
              )}

              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600">
                <span className="inline-flex items-center gap-1.5 text-emerald-700">Confirmed booking</span>
                <span className="inline-flex items-center gap-1.5 text-[#8a5a14]">Pending booking</span>
                <span className="inline-flex items-center gap-1.5">Off / unavailable</span>
                <span className="inline-flex items-center gap-1.5 text-rose-600 font-semibold">
                  <AlertTriangle className="w-3 h-3" />
                  Over capacity
                </span>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-3">
              <StatTile
                icon={<CalendarRange className="w-4 h-4 text-emerald-600" />}
                label="Upcoming bookings"
                count={upcomingBookings}
                hint="Confirmed and pending events"
              />
              <StatTile
                icon={<CalendarOff className="w-4 h-4 text-gray-500" />}
                label="Off days set"
                count={offDays}
                hint="Vacation, training, etc."
              />
              <StatTile
                icon={<AlertTriangle className="w-4 h-4 text-rose-600" />}
                label="Over capacity"
                count={overcapacityDays}
                hint={`Days exceeding ${capacity}/day`}
              />
            </section>
          </div>

          <aside className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6 h-fit lg:sticky lg:top-4">
            {selected ? (
              <SelectedDatePanel
                iso={selected}
                entry={selectedEntry}
                bookings={selectedBookings}
                capacity={capacity}
                onMarkOff={(note) => setOffDay(selected, note)}
                onClear={() => clearOffDay(selected)}
                onClose={() => setSelected(null)}
              />
            ) : (
              <EmptyPanel />
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}

/* ---------- Capacity card ---------- */

function CapacityCard({
  capacity,
  onChange,
  upcomingBookings,
  overcapacityDays,
}: {
  capacity: number
  onChange: (n: number) => void
  upcomingBookings: number
  overcapacityDays: number
}) {
  return (
    <section className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6 flex flex-wrap items-center gap-5">
      <span className="w-10 h-10 rounded-xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
        <Users className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-[260px]">
        <h3 className="text-sm font-semibold text-gray-900">Parallel-booking capacity</h3>
        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
          How many weddings your team can run on the same day. Solo vendors stay at 1; venues
          and multi-team studios can accept more. Couples can&rsquo;t request a date once it
          fills up.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={() => onChange(capacity - 1)}
          disabled={capacity <= 1}
          className="w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Decrease capacity"
        >
          <Minus className="w-4 h-4" />
        </button>
        <input
          type="number"
          min={1}
          max={20}
          value={capacity}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 text-center text-xl font-semibold text-gray-900 tabular-nums bg-white border border-gray-200 rounded-lg py-1.5 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
        />
        <button
          type="button"
          onClick={() => onChange(capacity + 1)}
          disabled={capacity >= 20}
          className="w-9 h-9 rounded-lg border border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          aria-label="Increase capacity"
        >
          <Plus className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-500 ml-1">/ day</span>
      </div>

      <div className="basis-full sm:basis-auto sm:ml-auto flex items-center gap-2">
        {overcapacityDays > 0 ? (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            {overcapacityDays} day{overcapacityDays === 1 ? '' : 's'} over capacity
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700">
          {upcomingBookings} upcoming bookings
        </span>
      </div>
    </section>
  )
}

/* ---------- View toggle ---------- */

function ViewToggle({
  view,
  onChange,
}: {
  view: CalendarView
  onChange: (v: CalendarView) => void
}) {
  const options: { id: CalendarView; label: string }[] = [
    { id: 'month', label: 'Month' },
    { id: 'week', label: 'Week' },
    { id: 'day', label: 'Day' },
  ]
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            'text-xs font-semibold px-3 py-1.5 rounded-md transition-colors',
            view === o.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900',
          )}
          aria-pressed={view === o.id}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ---------- Month view ---------- */

function MonthView({
  anchor,
  todayKey,
  selected,
  offByDate,
  bookingsByDate,
  capacity,
  onSelect,
  onWeekdayClick,
}: {
  anchor: Date
  todayKey: string
  selected: string | null
  offByDate: Map<string, AvailabilityDate>
  bookingsByDate: Map<string, CalendarBooking[]>
  capacity: number
  onSelect: (iso: string) => void
  onWeekdayClick: (idx: number) => void
}) {
  const grid = monthGrid(anchor.getFullYear(), anchor.getMonth())
  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div
            key={w}
            className="text-[10px] font-bold uppercase tracking-wider text-gray-400 text-center py-1.5"
          >
            <button
              type="button"
              onClick={() => onWeekdayClick(i)}
              className="hover:text-gray-700 transition-colors"
              title={`Block all ${w}s this month`}
            >
              {w}
            </button>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {grid.map((d) => {
          const iso = formatISODate(d)
          const inMonth = d.getMonth() === anchor.getMonth()
          const isToday = iso === todayKey
          const isSelected = iso === selected
          const off = offByDate.get(iso)
          const bookings = bookingsByDate.get(iso) ?? []
          const over = bookings.length > capacity
          return (
            <button
              key={iso}
              type="button"
              onClick={() => onSelect(iso)}
              className={cn(
                'relative aspect-square rounded-lg border text-left transition-colors p-1.5 flex flex-col gap-0.5 overflow-hidden',
                off
                  ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                  : 'bg-white border-gray-100 text-gray-900 hover:bg-gray-50',
                !inMonth && 'opacity-40',
                isToday && !off && 'border-gray-900',
                over && 'ring-1 ring-rose-400',
                isSelected && 'ring-2 ring-gray-900 ring-offset-1',
              )}
            >
              <span
                className={cn(
                  'text-xs font-semibold tabular-nums',
                  isToday && 'text-gray-900',
                )}
              >
                {d.getDate()}
              </span>
              {off ? (
                <span className="text-[9px] leading-tight font-bold uppercase tracking-wider mt-auto">
                  {off.note ? off.note : 'Off'}
                </span>
              ) : bookings.length > 0 ? (
                <span className="text-[9px] leading-tight font-medium mt-auto truncate">
                  {bookings[0].couple}
                  {bookings.length > 1 ? ` +${bookings.length - 1}` : ''}
                </span>
              ) : null}
              {bookings.length > 0 ? (
                <span className="absolute top-1 right-1.5 text-[9px] font-bold tabular-nums text-gray-500">
                  {bookings.length}
                </span>
              ) : null}
              {over ? (
                <span className="absolute bottom-1 right-1 text-rose-600">
                  <AlertTriangle className="w-3 h-3" />
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </>
  )
}

/* ---------- Week view ---------- */

function WeekView({
  anchor,
  todayKey,
  selected,
  offByDate,
  bookingsByDate,
  capacity,
  onSelect,
}: {
  anchor: Date
  todayKey: string
  selected: string | null
  offByDate: Map<string, AvailabilityDate>
  bookingsByDate: Map<string, CalendarBooking[]>
  capacity: number
  onSelect: (iso: string) => void
}) {
  const week = weekGrid(anchor)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
      {week.map((d) => {
        const iso = formatISODate(d)
        const isToday = iso === todayKey
        const isSelected = iso === selected
        const off = offByDate.get(iso)
        const bookings = bookingsByDate.get(iso) ?? []
        const over = bookings.length > capacity
        return (
          <button
            key={iso}
            type="button"
            onClick={() => onSelect(iso)}
            className={cn(
              'min-h-[180px] rounded-lg border p-2 flex flex-col text-left transition-colors',
              off
                ? 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
                : 'bg-white border-gray-100 hover:bg-gray-50',
              isToday && !off && 'border-gray-900',
              over && 'ring-1 ring-rose-400',
              isSelected && 'ring-2 ring-gray-900 ring-offset-1',
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                {WEEKDAY_LABELS[(d.getDay() + 6) % 7]}
              </span>
              <span
                className={cn(
                  'text-sm font-semibold tabular-nums',
                  isToday ? 'text-gray-900' : 'text-gray-700',
                )}
              >
                {d.getDate()}
              </span>
            </div>
            {off ? (
              <span className="text-[10px] leading-tight font-bold uppercase tracking-wider text-gray-500">
                {off.note ?? 'Off'}
              </span>
            ) : null}
            <div className="space-y-1 mt-1 flex-1">
              {bookings.map((b) => (
                <BookingChip key={b.id} booking={b} dense />
              ))}
            </div>
            <span className="mt-1 text-[10px] text-gray-500 tabular-nums">
              {bookings.length}/{capacity}
              {over ? <span className="ml-1 text-rose-600 font-semibold">over</span> : ''}
            </span>
          </button>
        )
      })}
    </div>
  )
}

/* ---------- Day view ---------- */

function DayView({
  anchor,
  todayKey,
  offByDate,
  bookings,
  capacity,
  onSelect,
}: {
  anchor: Date
  todayKey: string
  offByDate: Map<string, AvailabilityDate>
  bookings: CalendarBooking[]
  capacity: number
  onSelect: (iso: string) => void
}) {
  const iso = formatISODate(anchor)
  const off = offByDate.get(iso)
  const isToday = iso === todayKey
  const over = bookings.length > capacity
  const sorted = [...bookings].sort((a, b) => a.startTime.localeCompare(b.startTime))

  const earliest = sorted.length
    ? Math.min(...sorted.map((b) => parseInt(b.startTime.slice(0, 2), 10)))
    : 9
  const latest = sorted.length
    ? Math.max(...sorted.map((b) => parseInt(b.endTime.slice(0, 2), 10)))
    : 21
  const startHour = Math.max(0, Math.min(earliest, 9))
  const endHour = Math.min(24, Math.max(latest, 21))
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)

  useEffect(() => {
    onSelect(iso)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso])

  return (
    <div
      className={cn(
        'rounded-xl border p-4',
        off ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-100',
        isToday && 'ring-1 ring-gray-900',
      )}
    >
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
          {anchor.toLocaleDateString('en-GB', { weekday: 'long' })}
        </span>
        {off ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200">
            {off.note ?? 'Off'}
          </span>
        ) : null}
        {over ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3" />
            Over capacity ({bookings.length} / {capacity})
          </span>
        ) : (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-50 text-gray-600 border border-gray-200 tabular-nums">
            {bookings.length} / {capacity} booked
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/60 px-4 py-10 text-center">
          <p className="text-sm text-gray-500">
            {off ? 'No bookings — and the day is marked off.' : 'No bookings on this day yet.'}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100 -mx-2">
          {hours.map((h) => {
            const slot = `${String(h).padStart(2, '0')}:00`
            const overlapping = sorted.filter((b) => {
              const start = parseInt(b.startTime.slice(0, 2), 10)
              const end = parseInt(b.endTime.slice(0, 2), 10)
              return h >= start && h < end
            })
            const startsHere = sorted.filter(
              (b) => parseInt(b.startTime.slice(0, 2), 10) === h,
            )
            return (
              <li key={h} className="flex items-stretch gap-3 px-2 py-2 min-h-[44px]">
                <span className="w-12 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-gray-400 tabular-nums pt-1">
                  {slot}
                </span>
                <div className="flex-1 min-w-0 flex flex-wrap gap-1.5">
                  {startsHere.length > 0
                    ? startsHere.map((b) => <BookingChip key={b.id} booking={b} />)
                    : overlapping.length > 0
                      ? overlapping.map((b) => (
                          <span
                            key={`${b.id}-cont`}
                            className="text-[10px] text-gray-400 italic"
                          >
                            (continues — {b.couple})
                          </span>
                        ))
                      : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

/* ---------- Booking chip ---------- */

function BookingChip({
  booking,
  dense,
}: {
  booking: CalendarBooking
  dense?: boolean
}) {
  const meta = BOOKING_STATUS_META[booking.status]
  return (
    <Link
      href={`/bookings/${booking.id}`}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        'group block rounded-md border px-2 py-1 transition-colors',
        meta.pillClass,
        'hover:brightness-95',
      )}
    >
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="text-[10px] font-semibold truncate">
          {booking.startTime} {booking.couple}
        </span>
      </div>
      {!dense ? (
        <p className="text-[10px] opacity-80 mt-0.5 truncate">
          {booking.packageName} · {booking.location}
        </p>
      ) : null}
    </Link>
  )
}

/* ---------- Side panel ---------- */

function SelectedDatePanel({
  iso,
  entry,
  bookings,
  capacity,
  onMarkOff,
  onClear,
  onClose,
}: {
  iso: string
  entry: AvailabilityDate | undefined
  bookings: CalendarBooking[]
  capacity: number
  onMarkOff: (note?: string) => void
  onClear: () => void
  onClose: () => void
}) {
  const [note, setNote] = useState(entry?.note ?? '')

  useEffect(() => {
    setNote(entry?.note ?? '')
  }, [iso, entry?.note])

  const date = parseISODate(iso)
  const headline = date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const isOff = Boolean(entry)
  const over = bookings.length > capacity

  return (
    <div>
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Selected date
        </p>
        <button
          type="button"
          onClick={onClose}
          className="p-1 -mr-1 -mt-0.5 text-gray-400 hover:text-gray-700 rounded-md transition-colors"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <h3 className="text-sm font-semibold text-gray-900 leading-snug">{headline}</h3>

      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        {isOff ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-gray-100 text-gray-700 border-gray-200">
            <CalendarOff className="w-3 h-3" />
            Off
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-emerald-50 text-emerald-700 border-emerald-200">
            <CalendarDays className="w-3 h-3" />
            Operating
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border tabular-nums',
            over
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-gray-50 text-gray-600 border-gray-200',
          )}
        >
          {over ? <AlertTriangle className="w-3 h-3" /> : null}
          {bookings.length} / {capacity} booked
        </span>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-5 mb-2">
        Operating status
      </p>
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'text-xs font-semibold py-2 rounded-md border transition-colors',
            !isOff
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
          )}
        >
          Operating
        </button>
        <button
          type="button"
          onClick={() => onMarkOff(note.trim() || undefined)}
          className={cn(
            'text-xs font-semibold py-2 rounded-md border transition-colors',
            isOff
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400',
          )}
        >
          Mark off
        </button>
      </div>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-5 mb-2">
        Off-day note
      </p>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        onBlur={() => {
          if (isOff) onMarkOff(note.trim() || undefined)
        }}
        placeholder="e.g. Personal leave, training day"
        rows={3}
        className="w-full text-xs bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
      />
      <p className="text-[10px] text-gray-400 mt-1">
        Saves on blur. Couples don&rsquo;t see this — only that the date is unavailable.
      </p>

      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-6 mb-2">
        Bookings ({bookings.length})
      </p>
      {bookings.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No bookings on this date.</p>
      ) : (
        <ul className="space-y-2">
          {bookings.map((b) => (
            <li key={b.id}>
              <Link
                href={`/bookings/${b.id}`}
                className={cn(
                  'block rounded-md border px-3 py-2 hover:bg-gray-50 transition-colors',
                  BOOKING_STATUS_META[b.status].pillClass,
                )}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold truncate">
                    {b.startTime}–{b.endTime} · {b.couple}
                  </span>
                  <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                </div>
                <p className="text-[10px] opacity-80 mt-0.5 truncate">
                  {b.packageName} · {b.location}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {isOff ? (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear off-day mark
        </button>
      ) : null}
    </div>
  )
}

function EmptyPanel() {
  return (
    <div className="text-center py-6">
      <span className="mx-auto w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
        <CalendarDays className="w-5 h-5" />
      </span>
      <p className="text-sm font-semibold text-gray-900 mt-3">Click any date</p>
      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
        Mark it as off-day or see the bookings already scheduled for that date.
      </p>
    </div>
  )
}

function StatTile({
  icon,
  label,
  count,
  hint,
}: {
  icon: React.ReactNode
  label: string
  count: number
  hint?: string
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
      <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</p>
        <p className="text-lg font-semibold text-gray-900 tabular-nums leading-none mt-0.5">
          {count}
        </p>
        {hint ? <p className="text-[10px] text-gray-400 mt-0.5 truncate">{hint}</p> : null}
      </div>
    </div>
  )
}
