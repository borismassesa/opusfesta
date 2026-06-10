'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import Link from 'next/link'
import { Check, ChevronsUpDown, Plus, Store } from 'lucide-react'
import { setActiveBusiness } from '@/lib/business'
import type { VendorBusiness } from '@/lib/vendor'

const STATUS_LABELS: Record<VendorBusiness['status'], string> = {
  application_in_progress: 'Draft',
  verification_pending: 'Verification',
  admin_review: 'In review',
  needs_corrections: 'Needs fixes',
  active: 'Live',
  suspended: 'Suspended',
}

function statusPillClass(status: VendorBusiness['status']): string {
  if (status === 'active') return 'bg-[#9FE870]/30 text-green-900'
  if (status === 'suspended') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-800'
}

/**
 * Dropdown for users who run more than one vendor business (one profile per
 * category). Switching calls a server action that re-points the active-vendor
 * cookie and reloads the portal as that business. Always offers "Add another
 * business", which restarts onboarding on a fresh draft.
 */
export function BusinessSwitcher({
  businesses,
  activeId,
}: {
  businesses: VendorBusiness[]
  activeId: string
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const active = businesses.find((b) => b.id === activeId) ?? businesses[0]
  if (!active) return null

  const switchTo = (id: string) => {
    if (id === active.id) {
      setOpen(false)
      return
    }
    startTransition(async () => {
      await setActiveBusiness(id)
    })
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={isPending}
        className="inline-flex max-w-56 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
      >
        <Store className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="truncate">{active.name}</span>
        <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-gray-400" />
      </button>

      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg"
        >
          <p className="px-4 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Your businesses
          </p>
          <ul className="max-h-72 overflow-y-auto py-1">
            {businesses.map((b) => (
              <li key={b.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={b.id === active.id}
                  onClick={() => switchTo(b.id)}
                  disabled={isPending}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-gray-50 disabled:opacity-60"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-gray-900">
                      {b.name}
                    </span>
                    <span className="block truncate text-xs text-gray-500">
                      {b.category}
                    </span>
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusPillClass(b.status)}`}
                  >
                    {STATUS_LABELS[b.status]}
                  </span>
                  {b.id === active.id ? (
                    <Check className="h-4 w-4 shrink-0 text-gray-900" />
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/onboard/new"
            className="flex items-center gap-2 border-t border-gray-100 px-4 py-3 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
          >
            <Plus className="h-4 w-4" />
            Add another business
          </Link>
        </div>
      ) : null}
    </div>
  )
}
