'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AlertCircle, Check, ChevronRight, CircleDashed, Eye, Lock, Minus } from 'lucide-react'
import { useOnboardingDraft } from '@/lib/onboarding/draft'
import {
  computeCompleteness,
  getStorefrontSections,
  type SectionStatus,
} from '@/lib/storefront/completion'
import { cn } from '@/lib/utils'

export function StorefrontSidebar() {
  const pathname = usePathname()
  const { draft, hydrated } = useOnboardingDraft()

  if (!hydrated) {
    return (
      <div
        className="w-72 shrink-0 border-r border-gray-100 bg-white h-full"
        aria-hidden
      />
    )
  }

  // Vendors who haven't submitted onboarding see the gate screen instead of the
  // sidebar — without this the sidebar would render alongside that gate.
  if (!draft.categoryId || !draft.submittedAt) {
    return null
  }

  const sections = getStorefrontSections(draft)
  const { percent, complete, total, requiredMissing } = computeCompleteness(sections)

  return (
    <aside className="w-72 shrink-0 border-r border-gray-100 bg-white h-full flex flex-col">
      {/* Top header */}
      <div className="px-5 pt-6 pb-4 border-b border-gray-100">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
          Storefront
        </p>
        <h2 className="text-base font-semibold text-gray-900 tracking-tight mt-1">
          Manage your storefront
        </h2>
      </div>

      {/* Nav — fills available space, scrolls internally if it overflows */}
      <nav
        className="flex-1 overflow-y-auto p-2"
        aria-label="Storefront sections"
      >
        {sections.map((section) => {
          const isActive = pathname === section.href
          return (
            <Link
              key={section.id}
              href={section.href}
              className={cn(
                'group flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors',
                isActive ? 'bg-gray-100' : 'hover:bg-gray-50',
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <StatusIcon status={section.status} />
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'text-sm font-semibold',
                      isActive ? 'text-gray-900' : 'text-gray-800',
                    )}
                  >
                    {section.label}
                  </span>
                  {section.required &&
                  section.status !== 'complete' &&
                  section.status !== 'auto' ? (
                    <span className="text-[10px] uppercase tracking-wider font-bold text-amber-700">
                      Required
                    </span>
                  ) : null}
                </span>
                <span className="block text-xs text-gray-500 mt-0.5 truncate">
                  {section.hint}
                </span>
              </span>
              <ChevronRight
                className={cn(
                  'w-4 h-4 mt-1 shrink-0 transition-transform',
                  isActive
                    ? 'text-gray-700 translate-x-0.5'
                    : 'text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5',
                )}
                aria-hidden
              />
            </Link>
          )
        })}
      </nav>

      {/* Bottom: completion summary + preview link */}
      <div className="border-t border-gray-100 px-5 pt-5 pb-5 bg-white">
        <div className="flex items-center gap-4">
          <CircularProgress percent={percent} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-tight">
              Profile completeness
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {complete} of {total} sections complete
            </p>
          </div>
        </div>

        {requiredMissing.length > 0 ? (
          <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900 leading-snug">
              <span className="font-semibold">
                {requiredMissing.length} required section
                {requiredMissing.length === 1 ? '' : 's'}
              </span>{' '}
              still need attention before couples can book you.
            </p>
          </div>
        ) : null}

        <Link
          href="#"
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
        >
          <Eye className="w-3.5 h-3.5" /> Preview public storefront
        </Link>
      </div>
    </aside>
  )
}

function CircularProgress({ percent }: { percent: number }) {
  const size = 56
  const stroke = 5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (Math.max(0, Math.min(100, percent)) / 100) * circumference

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Profile ${percent}% complete`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          fill="none"
          className="text-gray-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-emerald-500 transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold tabular-nums text-gray-900">
        {percent}%
      </span>
    </div>
  )
}

function StatusIcon({ status }: { status: SectionStatus }) {
  if (status === 'complete') {
    return (
      <span
        className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center"
        aria-label="Complete"
      >
        <Check className="w-3 h-3" strokeWidth={3} />
      </span>
    )
  }
  if (status === 'partial') {
    return (
      <span
        className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center"
        aria-label="Partially complete"
      >
        <Minus className="w-3 h-3" strokeWidth={3} />
      </span>
    )
  }
  if (status === 'auto') {
    return (
      <span
        className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center"
        aria-label="Auto-collected"
      >
        <Lock className="w-3 h-3" />
      </span>
    )
  }
  return (
    <span
      className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center"
      aria-label="Not started"
    >
      <CircleDashed className="w-3.5 h-3.5" />
    </span>
  )
}
