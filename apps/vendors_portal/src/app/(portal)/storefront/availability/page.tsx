'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronLeft, ChevronRight, Save } from 'lucide-react'
import { useOnboardingDraft, type AvailabilityDate } from '@/lib/onboarding/draft'
import { getStorefrontSections } from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'
import { loadAvailability, saveAvailability } from '../sections/actions'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
// How many months ahead the vendor can navigate / mark.
const MAX_MONTH_OFFSET = 12

const pad = (n: number) => String(n).padStart(2, '0')
const toISO = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`

export default function AvailabilityPage() {
  const router = useRouter()
  const { draft, update, hydrated } = useOnboardingDraft()
  const [monthOffset, setMonthOffset] = useState(0)
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
    if (draft.availability.length > 0) return
    void loadAvailability().then((res) => {
      if (res.ok && res.entries.length > 0) {
        update({ availability: res.entries })
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated])

  const statusByDate = useMemo(() => {
    const m = new Map<string, AvailabilityDate['status']>()
    for (const a of availability) m.set(a.date, a.status)
    return m
  }, [availability])

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

  // Tapping a date cycles its status: open -> unavailable -> limited -> open.
  // A short cycle keeps the whole calendar editable with a single gesture and
  // no separate "brush" mode to discover.
  const cycle = (iso: string) => {
    if (!hydrated || iso < todayISO) return
    setSaveOk(false)
    const cur = statusByDate.get(iso)
    const rest = availability.filter((a) => a.date !== iso)
    let next: AvailabilityDate[]
    if (!cur) next = [...rest, { date: iso, status: 'unavailable' }]
    else if (cur === 'unavailable') next = [...rest, { date: iso, status: 'limited' }]
    else next = rest // 'limited' -> cleared
    update({ availability: next.sort((a, b) => a.date.localeCompare(b.date)) })
  }

  const onSave = () => {
    setSaveError(null)
    setSaveOk(false)
    startSaving(async () => {
      const res = await saveAvailability(availability)
      if (!res.ok) {
        setSaveError(res.error)
        return
      }
      setSaveOk(true)
    })
  }

  const unavailableCount = availability.filter((a) => a.status === 'unavailable').length
  const limitedCount = availability.filter((a) => a.status === 'limited').length

  const cells: Array<{ iso: string; day: number } | null> = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push({ iso: toISO(year, month, d), day: d })

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1 px-6 lg:px-10 pt-4 lg:pt-5 pb-6">
        <div className="max-w-2xl">
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Tap a date to mark it. Tap again to cycle: open, then{' '}
            <span className="font-semibold text-rose-600">unavailable</span>, then{' '}
            <span className="font-semibold text-amber-600">limited</span>, then back to
            open. Couples see this calendar on your public storefront.
          </p>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] p-5 lg:p-6">
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button
                type="button"
                onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
                disabled={monthOffset === 0}
                aria-label="Previous month"
                className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-sm font-semibold text-gray-900">
                {MONTHS[month]} {year}
              </p>
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

            {/* Weekday header */}
            <div className="grid grid-cols-7 gap-1 mb-1">
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
            <div className="grid grid-cols-7 gap-1">
              {cells.map((cell, i) => {
                if (!cell) return <div key={`blank-${i}`} />
                const status = statusByDate.get(cell.iso)
                const isPast = cell.iso < todayISO
                const isToday = cell.iso === todayISO
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    onClick={() => cycle(cell.iso)}
                    disabled={isPast || !hydrated}
                    aria-label={`${cell.iso}${status ? ` — ${status}` : ''}`}
                    className={cn(
                      'aspect-square rounded-lg text-sm font-medium flex items-center justify-center transition-colors',
                      isPast && 'text-gray-300 cursor-not-allowed',
                      !isPast && !status && 'text-gray-700 hover:bg-gray-100',
                      status === 'unavailable' && 'bg-rose-100 text-rose-700 hover:bg-rose-200',
                      status === 'limited' && 'bg-amber-100 text-amber-700 hover:bg-amber-200',
                      isToday && 'ring-1 ring-inset ring-gray-900/40',
                    )}
                  >
                    {cell.day}
                  </button>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-rose-100 border border-rose-200" /> Unavailable
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> Limited
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-white border border-gray-200" /> Open
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky save bar */}
      <div className="sticky bottom-0 border-t border-gray-100 bg-white/95 backdrop-blur z-30">
        <div className="px-6 lg:px-10 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="text-xs text-gray-500">
            <span className="font-semibold text-rose-600 tabular-nums">{unavailableCount}</span>{' '}
            unavailable ·{' '}
            <span className="font-semibold text-amber-600 tabular-nums">{limitedCount}</span>{' '}
            limited
            {saveError && <span className="ml-3 text-rose-700">{saveError}</span>}
            {saveOk && !saveError && (
              <span className="ml-3 text-emerald-700">Saved.</span>
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
