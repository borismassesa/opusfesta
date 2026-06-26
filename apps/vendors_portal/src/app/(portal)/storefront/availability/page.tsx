'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Save,
  StickyNote,
  X,
} from 'lucide-react'
import {
  useOnboardingDraft,
  type AvailabilityDate,
  type DayHours,
} from '@/lib/onboarding/draft'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'
import {
  loadAvailability,
  loadBusinessHours,
  saveAvailability,
  saveProfileFields,
} from '../sections/actions'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = [
  { key: 'mon', label: 'Monday', short: 'Mon' },
  { key: 'tue', label: 'Tuesday', short: 'Tue' },
  { key: 'wed', label: 'Wednesday', short: 'Wed' },
  { key: 'thu', label: 'Thursday', short: 'Thu' },
  { key: 'fri', label: 'Friday', short: 'Fri' },
  { key: 'sat', label: 'Saturday', short: 'Sat' },
  { key: 'sun', label: 'Sunday', short: 'Sun' },
] as const
type DayKey = (typeof DAYS)[number]['key']

// How many months ahead the vendor can navigate / mark.
const MAX_MONTH_OFFSET = 12

const PLACEHOLDER_HOURS: DayHours = { open: false, from: '09:00', to: '18:00' }

// Subtle diagonal hatch marking weekly-closed days on the calendar.
const CLOSED_HATCH = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(17,24,39,0.06) 0, rgba(17,24,39,0.06) 2px, transparent 2px, transparent 6px)',
} as const

// Denser, higher-contrast hatch for the small legend swatch so it reads clearly.
const CLOSED_HATCH_STRONG = {
  backgroundImage:
    'repeating-linear-gradient(45deg, rgba(17,24,39,0.45) 0, rgba(17,24,39,0.45) 1.5px, transparent 1.5px, transparent 4px)',
} as const

const STATUS_OPTIONS: Array<{
  value: AvailabilityDate['status'] | 'open'
  label: string
  activeClass: string
}> = [
  { value: 'open', label: 'Open', activeClass: 'border-emerald-300 bg-emerald-100 text-emerald-800' },
  { value: 'limited', label: 'Limited', activeClass: 'border-amber-300 bg-amber-100 text-amber-800' },
  { value: 'unavailable', label: 'Unavailable', activeClass: 'border-rose-300 bg-rose-100 text-rose-800' },
]

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`
const formatDateLong = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AvailabilityPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [monthOffset, setMonthOffset] = useState(0)
  const [selectedISO, setSelectedISO] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveOk, setSaveOk] = useState(false)

  const availability = hydrated ? draft.availability : []

  // Hydrate from the DB (source of truth) when the local draft is empty — a
  // fresh device / cleared storage / admin-approved vendor would otherwise see
  // an empty calendar despite having blocked dates. Seed only when empty so we
  // never clobber unsaved edits made on this device.
  const seeded = useRef(false)
  useEffect(() => {
    if (!hydrated || seeded.current) return
    seeded.current = true
    if (draft.availability.length === 0) {
      void loadAvailability().then((res) => {
        if (res.ok && res.entries.length > 0) update({ availability: res.entries })
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  // Business hours live on vendors.hours but were never read back into the
  // local draft — so a fresh device would show client defaults and could save
  // them over real hours. Seed from the DB once, unless the vendor has already
  // touched the hours on this device (guarded so we never clobber live edits).
  const hoursTouched = useRef(false)
  const hoursSeeded = useRef(false)
  useEffect(() => {
    if (!hydrated || hoursSeeded.current) return
    hoursSeeded.current = true
    void loadBusinessHours().then((res) => {
      if (res.ok && res.hours && !hoursTouched.current) {
        update({ hours: res.hours })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const entryByDate = useMemo(() => {
    const m = new Map<string, AvailabilityDate>()
    for (const a of availability) m.set(a.date, a)
    return m
  }, [availability])
  const selectedEntry = selectedISO ? entryByDate.get(selectedISO) : undefined

  // Weekly-closed days (from Business hours) are reflected on the calendar as a
  // muted "Closed" backdrop — distinct from a specifically blocked date and not
  // counted in the unavailable tally. Indexed by JS getDay(): 0=Sun … 6=Sat.
  const closedWeekday = useMemo(() => {
    const order: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
    return order.map((k) => (hydrated ? !draft.hours[k].open : false))
  }, [hydrated, draft.hours])

  const nextHref = useMemo(() => {
    const sections = getStorefrontSections(draft)
    const idx = sections.findIndex((s) => s.id === 'availability')
    return idx >= 0 && idx < sections.length - 1 ? sections[idx + 1].href : null
  }, [draft])

  const today = new Date()
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate())
  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1)
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // Tapping a date opens the inline editor below the calendar, where the vendor
  // picks its status and can attach a private note — rather than blindly cycling
  // colours with no way to record *why* a date is blocked.
  const selectDate = (iso: string) => {
    if (!hydrated || iso < todayISO) return
    setSelectedISO((cur) => (cur === iso ? null : iso))
  }

  const setDateStatus = (iso: string, status: AvailabilityDate['status'] | 'open') => {
    if (!hydrated) return
    setSaveOk(false)
    const existing = entryByDate.get(iso)
    const rest = availability.filter((a) => a.date !== iso)
    const next: AvailabilityDate[] =
      status === 'open'
        ? rest
        : [...rest, { date: iso, status, ...(existing?.note ? { note: existing.note } : {}) }]
    update({ availability: next.sort((a, b) => a.date.localeCompare(b.date)) })
  }

  const setDateNote = (iso: string, note: string) => {
    if (!hydrated) return
    const existing = entryByDate.get(iso)
    if (!existing) return // a note only attaches to a blocked / limited date
    setSaveOk(false)
    const rest = availability.filter((a) => a.date !== iso)
    const trimmed = note.slice(0, 120)
    update({
      availability: [
        ...rest,
        { ...existing, note: trimmed.trim() ? trimmed : undefined },
      ].sort((a, b) => a.date.localeCompare(b.date)),
    })
  }

  const updateDay = (key: DayKey, patch: Partial<DayHours>) => {
    if (!hydrated) return
    hoursTouched.current = true
    setSaveOk(false)
    update({ hours: { ...draft.hours, [key]: { ...draft.hours[key], ...patch } } })
  }

  const copyMonToWeekdays = () => {
    if (!hydrated) return
    hoursTouched.current = true
    setSaveOk(false)
    const monday = draft.hours.mon
    const next = { ...draft.hours }
    ;(['tue', 'wed', 'thu', 'fri'] as const).forEach((k) => {
      next[k] = { ...monday }
    })
    update({ hours: next })
  }

  const onSave = () => {
    setSaveError(null)
    setSaveOk(false)
    startSaving(async () => {
      const [availRes, hoursRes] = await Promise.all([
        saveAvailability(availability),
        saveProfileFields({ hours: draft.hours }),
      ])
      if (!availRes.ok) return setSaveError(availRes.error)
      if (!hoursRes.ok) return setSaveError(hoursRes.error)
      setSaveOk(true)
    })
  }

  const unavailableCount = availability.filter((a) => a.status === 'unavailable').length
  const limitedCount = availability.filter((a) => a.status === 'limited').length
  const openDaysCount = hydrated ? DAYS.filter((d) => draft.hours[d.key].open).length : 0

  const cells: Array<{ iso: string; day: number } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ iso: toISO(year, month, d), day: d })

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm text-gray-600 mb-5 leading-relaxed max-w-2xl">
            Tap a date to set it{' '}
            <span className="font-semibold text-rose-600">unavailable</span> or{' '}
            <span className="font-semibold text-amber-600">limited</span>, and add a
            private note for context. Days you are closed every week show greyed
            automatically from your hours. Couples see your open dates and hours on
            your public storefront.
          </p>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_24rem] items-start">
            {/* ── Calendar ─────────────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-gray-900">
                    {MONTHS[month]} {year}
                  </p>
                  {monthOffset !== 0 && (
                    <button
                      type="button"
                      onClick={() => setMonthOffset(0)}
                      className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 underline underline-offset-2 transition-colors"
                    >
                      Today
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                    disabled={monthOffset === 0}
                    aria-label="Previous month"
                    className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMonthOffset((o) => Math.min(MAX_MONTH_OFFSET, o + 1))}
                    disabled={monthOffset >= MAX_MONTH_OFFSET}
                    aria-label="Next month"
                    className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday header */}
              <div className="grid grid-cols-7 gap-1.5 mb-1.5">
                {WEEKDAYS.map((w) => (
                  <div
                    key={w}
                    className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 text-center py-1"
                  >
                    {w}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1.5">
                {cells.map((cell, i) => {
                  if (!cell) return <div key={`blank-${i}`} />
                  const entry = entryByDate.get(cell.iso)
                  const status = entry?.status
                  const isPast = cell.iso < todayISO
                  const isToday = cell.iso === todayISO
                  const isSelected = cell.iso === selectedISO
                  const isClosedDay =
                    !status && !isPast && closedWeekday[new Date(year, month, cell.day).getDay()]
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => selectDate(cell.iso)}
                      disabled={isPast || !hydrated}
                      aria-label={`${cell.iso} — ${status ?? (isClosedDay ? 'closed' : 'open')}${entry?.note ? ` — ${entry.note}` : ''}`}
                      aria-pressed={isSelected}
                      style={isClosedDay ? CLOSED_HATCH : undefined}
                      className={cn(
                        'group relative aspect-square rounded-xl text-sm font-medium flex items-center justify-center border transition-all',
                        isPast && 'border-transparent text-gray-300 cursor-not-allowed',
                        !isPast && !status && !isClosedDay &&
                          'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                        isClosedDay && 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100',
                        status === 'unavailable' &&
                          'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100',
                        status === 'limited' &&
                          'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
                        isToday && !isSelected && 'ring-2 ring-gray-900/30 ring-offset-1',
                        isSelected && 'ring-2 ring-gray-900 ring-offset-1',
                      )}
                    >
                      {cell.day}
                      {status && (
                        <span
                          className={cn(
                            'absolute bottom-1.5 h-1.5 w-1.5 rounded-full',
                            status === 'unavailable' ? 'bg-rose-500' : 'bg-amber-500',
                          )}
                        />
                      )}
                      {entry?.note && (
                        <>
                          <StickyNote
                            className="absolute top-1 right-1 h-2.5 w-2.5 text-gray-500"
                            aria-hidden="true"
                          />
                          {/* Hover / focus tooltip revealing the private note. */}
                          <span
                            role="tooltip"
                            className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-max max-w-[180px] -translate-x-1/2 whitespace-normal rounded-md bg-gray-900 px-2 py-1 text-left text-[11px] font-medium leading-snug text-white shadow-lg group-hover:block group-focus:block"
                          >
                            {entry.note}
                          </span>
                        </>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-5 pt-4 border-t border-gray-100 text-xs font-medium text-gray-700">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-emerald-300 border border-emerald-500" /> Open
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-amber-300 border border-amber-500" /> Limited
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-3.5 h-3.5 rounded bg-rose-300 border border-rose-500" /> Unavailable
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span
                    className="w-3.5 h-3.5 rounded bg-gray-200 border border-gray-400"
                    style={CLOSED_HATCH_STRONG}
                  />{' '}
                  Closed
                </span>
              </div>

              {/* Selected-date editor — set the status and an optional note. */}
              {selectedISO && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/70 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDateLong(selectedISO)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setSelectedISO(null)}
                      aria-label="Close"
                      className="text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {STATUS_OPTIONS.map((opt) => {
                      const active = (selectedEntry?.status ?? 'open') === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setDateStatus(selectedISO, opt.value)}
                          className={cn(
                            'rounded-lg border px-2 py-2 text-xs font-semibold transition-colors',
                            !active && 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
                            active && opt.activeClass,
                          )}
                        >
                          {opt.label}
                        </button>
                      )
                    })}
                  </div>

                  {selectedEntry && (
                    <label className="mt-3 block">
                      <span className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                        <StickyNote className="w-3 h-3" />
                        Note (only you see this)
                      </span>
                      <input
                        type="text"
                        value={selectedEntry.note ?? ''}
                        onChange={(e) => setDateNote(selectedISO, e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedISO(null)}
                        maxLength={120}
                        placeholder="e.g. Fully booked — Asha &amp; Juma's wedding"
                        className="w-full bg-white border border-gray-300 rounded-md px-2.5 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
                      />
                    </label>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2">
                    {selectedEntry ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDateStatus(selectedISO, 'open')
                          setSelectedISO(null)
                        }}
                        className="text-xs font-semibold text-gray-500 hover:text-rose-600 transition-colors"
                      >
                        Clear date
                      </button>
                    ) : (
                      <span />
                    )}
                    <button
                      type="button"
                      onClick={() => setSelectedISO(null)}
                      className="inline-flex items-center gap-1.5 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-800 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Done
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-gray-400">
                    Changes apply when you hit Save below.
                  </p>
                </div>
              )}
            </div>

            {/* ── Business hours ──────────────────────────────────────── */}
            <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="inline-flex items-center gap-2 text-base font-semibold text-gray-900">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Business hours
                </h2>
                <button
                  type="button"
                  onClick={copyMonToWeekdays}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  Copy Mon to Fri
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3 leading-relaxed">
                The days and times couples can reach you. Unchecked days show greyed
                on the calendar.
              </p>

              <div className="divide-y divide-gray-100">
                {DAYS.map((d) => (
                  <DayRow
                    key={d.key}
                    label={d.label}
                    short={d.short}
                    value={hydrated ? draft.hours[d.key] : PLACEHOLDER_HOURS}
                    onChange={(patch) => updateDay(d.key, patch)}
                  />
                ))}
              </div>

              <p className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span className="font-semibold text-gray-900 tabular-nums">{openDaysCount}</span>{' '}
                {openDaysCount === 1 ? 'day' : 'days'} open per week
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-gray-500 flex items-center gap-x-3 gap-y-1 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-rose-600 tabular-nums">{unavailableCount}</span>{' '}
              unavailable ·{' '}
              <span className="font-semibold text-amber-600 tabular-nums">{limitedCount}</span>{' '}
              limited
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-semibold text-gray-900 tabular-nums">{openDaysCount}</span>{' '}
              {openDaysCount === 1 ? 'day' : 'days'} open
            </span>
            {saveError && <span className="text-rose-700">{saveError}</span>}
            {saveOk && !saveError && (
              <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" /> Saved.
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !hydrated}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              {saving ? 'Saving…' : 'Save'}
            </button>
            {nextHref && (
              <button
                type="button"
                onClick={() => router.push(nextHref)}
                className="inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-gray-800 transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayRow({
  label,
  short,
  value,
  onChange,
}: {
  label: string
  short: string
  value: DayHours
  onChange: (patch: Partial<DayHours>) => void
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <label
        className="flex items-center gap-2.5 cursor-pointer w-[68px] shrink-0 select-none"
        title={label}
      >
        <input
          type="checkbox"
          checked={value.open}
          onChange={(e) => onChange({ open: e.target.checked })}
          className="w-4 h-4 accent-gray-900"
        />
        <span className="text-sm font-semibold text-gray-900">{short}</span>
      </label>
      {value.open ? (
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <input
            type="time"
            value={value.from}
            onChange={(e) => onChange({ from: e.target.value })}
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
          />
          <span className="text-gray-400 text-xs shrink-0">–</span>
          <input
            type="time"
            value={value.to}
            onChange={(e) => onChange({ to: e.target.value })}
            className="flex-1 min-w-0 bg-white border border-gray-300 rounded-md px-2 py-1.5 text-sm text-gray-900 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none"
          />
        </div>
      ) : (
        <span className="text-sm text-gray-400 italic">Closed</span>
      )}
    </div>
  )
}
