'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Building2, ChevronDown } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'
import { useSetPageSearch } from '@/components/PageSearch'
import { QueueHealthStrip } from './_components/QueueHealthStrip'
import { VendorRowCard } from './_components/VendorRowCard'
import type {
  QueueHealth,
  VendorAccount,
  VendorStatus,
  VendorStatusCounts,
} from './_lib/types'

type ListStatus = VendorStatus | 'all'
type SortMode = 'oldest' | 'newest' | 'name'

const SORT_LABELS: Record<SortMode, string> = {
  oldest: 'Oldest in queue',
  newest: 'Newest first',
  name: 'Name (A → Z)',
}

const STATUS_TABS: Array<{ id: ListStatus; label: string; description: string }> = [
  {
    id: 'all',
    label: 'All',
    description: 'Every vendor record.',
  },
  {
    id: 'awaiting_review',
    label: 'Awaiting review',
    description: 'Submitted everything, waiting on us.',
  },
  {
    id: 'needs_corrections',
    label: 'Corrections',
    description: 'Bounced back to vendor with notes.',
  },
  {
    id: 'uploading_docs',
    label: 'Uploading',
    description: 'Application submitted, docs in progress.',
  },
  {
    id: 'drafting',
    label: 'Drafting',
    description: 'Started the wizard, not yet submitted.',
  },
  {
    id: 'active',
    label: 'Active',
    description: 'Approved and live on OpusFesta.',
  },
  {
    id: 'suspended',
    label: 'Suspended',
    description: 'Manually disabled by admin.',
  },
]

const ALPHABET: string[] = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i),
)

export default function VendorsListClient({
  vendors,
  status,
  counts,
  health,
  slaHours,
}: {
  vendors: VendorAccount[]
  status: ListStatus
  counts: VendorStatusCounts
  health: QueueHealth
  slaHours: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const initialQ = searchParams?.get('q') ?? ''
  const initialSort = (searchParams?.get('sort') as SortMode) ?? 'oldest'
  const initialLetter = searchParams?.get('letter') ?? 'all'

  const [search, setSearch] = useState(initialQ)
  const [sort, setSort] = useState<SortMode>(
    initialSort === 'oldest' || initialSort === 'newest' || initialSort === 'name'
      ? initialSort
      : 'oldest',
  )
  const [letter, setLetter] = useState<string>(
    /^[A-Z]$/.test(initialLetter) ? initialLetter : 'all',
  )

  // Header is driven by live status data per OF-ENG-SPEC-002 §5.
  const activeTab = STATUS_TABS.find((t) => t.id === status)
  useSetPageHeading({
    title: 'Vendor accounts',
    subtitle: activeTab?.description ?? 'Every vendor record.',
  })

  // Search input lives in the global admin Header — register the placeholder
  // and wiring here so the input shows up there on this page only.
  useSetPageSearch({
    value: search,
    placeholder: 'Search vendors, IDs, contacts…',
    ariaLabel: 'Search vendors',
    onChange: (next) => setSearch(next),
    onClear: () => setSearch(''),
  })

  // URL sync — debounced for `q`, immediate for the rest. Uses replace so
  // the tab/sort doesn't pollute history.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const next = new URLSearchParams(searchParams?.toString() ?? '')
      if (search.trim()) next.set('q', search.trim())
      else next.delete('q')
      const current = searchParams?.get('q') ?? ''
      if ((current ?? '') === (next.get('q') ?? '')) return
      router.replace(
        next.toString() ? `/operations/vendors?${next}` : '/operations/vendors',
        { scroll: false },
      )
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [search, router, searchParams])

  const writeParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams?.toString() ?? '')
    if (value && value !== 'all') next.set(key, value)
    else next.delete(key)
    router.replace(
      next.toString() ? `/operations/vendors?${next}` : '/operations/vendors',
      { scroll: false },
    )
  }

  const handleStatusChange = (next: ListStatus) => {
    // `writeParam` already drops the URL key when value is 'all' (the new
    // default), so we just hand it the raw status — clicking 'all' clears
    // the param, every other tab sets it.
    writeParam('status', next)
  }

  const handleSortChange = (next: SortMode) => {
    setSort(next)
    writeParam('sort', next === 'oldest' ? null : next)
  }

  const handleLetterChange = (next: string) => {
    setLetter(next)
    writeParam('letter', next === 'all' ? null : next)
  }

  // Bucket vendors by first letter for the alphabet filter; same fold rule
  // as the Filter dropdown below — non-letters go to '#'.
  const bucketFor = (v: VendorAccount): string => {
    const ch = (v.businessName.trim().charAt(0) || '').toUpperCase()
    return ch >= 'A' && ch <= 'Z' ? ch : '#'
  }

  const lettersWithCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of vendors) {
      const b = bucketFor(v)
      map.set(b, (map.get(b) ?? 0) + 1)
    }
    return map
  }, [vendors])

  const visibleVendors = useMemo(() => {
    let list = vendors

    if (letter !== 'all') {
      list = list.filter((v) => bucketFor(v) === letter)
    }

    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((v) => {
        const haystack = [
          v.businessName,
          v.publicId,
          v.category,
          v.city ?? '',
          v.submittedByName ?? '',
        ]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }

    const sorted = [...list]
    sorted.sort((a, b) => {
      switch (sort) {
        case 'oldest': {
          const aT = a.submittedAt ? new Date(a.submittedAt).getTime() : Infinity
          const bT = b.submittedAt ? new Date(b.submittedAt).getTime() : Infinity
          return aT - bT
        }
        case 'newest': {
          const aT = a.submittedAt
            ? new Date(a.submittedAt).getTime()
            : new Date(a.createdAt).getTime()
          const bT = b.submittedAt
            ? new Date(b.submittedAt).getTime()
            : new Date(b.createdAt).getTime()
          return bT - aT
        }
        case 'name':
          return a.businessName.localeCompare(b.businessName, undefined, {
            sensitivity: 'base',
          })
      }
    })
    return sorted
  }, [vendors, letter, search, sort])

  const totalCount = vendors.length
  const showHealth = status === 'awaiting_review' || status === 'all'

  return (
    <div className="px-8 pt-4 pb-12">
      <div className="max-w-[1200px] mx-auto">
        {/* Search now lives in the global admin Header (registered via
            useSetPageSearch above). */}

        {/* Queue health */}
        {showHealth && <QueueHealthStrip health={health} />}

        {/* Status tabs — pill-shaped, matches the wireframe */}
        <div className="bg-gray-50 rounded-lg p-1 mb-4 overflow-x-auto">
          <div className="flex items-center gap-0.5 min-w-max">
            {STATUS_TABS.map((tab) => {
              const isActive = tab.id === status
              const count = counts[tab.id as keyof VendorStatusCounts]
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleStatusChange(tab.id)}
                  aria-pressed={isActive}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                    isActive
                      ? 'bg-gray-900 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900',
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      'inline-flex items-center justify-center min-w-[20px] h-[18px] px-1.5 rounded-full text-[11px] font-semibold tabular-nums',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-200/70 text-gray-600',
                    )}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Toolbar — count + sort + filter */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <p className="text-xs text-gray-500">
            {visibleVendors.length === 0
              ? 'No vendors'
              : visibleVendors.length === 1
                ? '1 vendor'
                : `${visibleVendors.length} vendors`}
            {letter !== 'all' && ` · starting with ${letter}`}
            {search.trim() && ` · matching "${search.trim()}"`}
            {!letter || letter === 'all'
              ? ` · sorted by ${SORT_LABELS[sort].toLowerCase()}`
              : null}
          </p>
          <div className="flex items-center gap-2">
            <SortMenu value={sort} onChange={handleSortChange} />
            <FilterMenu
              letter={letter}
              onLetterChange={handleLetterChange}
              lettersWithCounts={lettersWithCounts}
            />
          </div>
        </div>

        {/* Row cards */}
        {visibleVendors.length === 0 ? (
          <EmptyState
            search={search}
            letter={letter}
            totalInStatus={totalCount}
          />
        ) : (
          <ul className="space-y-2.5">
            {visibleVendors.map((v) => (
              <li key={v.id}>
                <VendorRowCard vendor={v} slaHours={slaHours} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// --- Sub-components --------------------------------------------------------

function SortMenu({
  value,
  onChange,
}: {
  value: SortMode
  onChange: (next: SortMode) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 h-8 text-xs font-medium text-gray-700 hover:border-gray-300 transition-colors"
      >
        Sort: {SORT_LABELS[value]}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20"
        >
          {(Object.keys(SORT_LABELS) as SortMode[]).map((mode) => (
            <button
              key={mode}
              role="menuitem"
              type="button"
              onClick={() => {
                onChange(mode)
                setOpen(false)
              }}
              className={cn(
                'block w-full text-left px-3 py-2 text-xs hover:bg-gray-50 transition-colors',
                value === mode ? 'font-semibold text-gray-900' : 'text-gray-700',
              )}
            >
              {SORT_LABELS[mode]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function FilterMenu({
  letter,
  onLetterChange,
  lettersWithCounts,
}: {
  letter: string
  onLetterChange: (next: string) => void
  lettersWithCounts: Map<string, number>
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  const isFiltered = letter !== 'all'

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'inline-flex items-center gap-1.5 bg-white border rounded-lg px-3 h-8 text-xs font-medium transition-colors',
          isFiltered
            ? 'border-[#5B2D8E]/40 text-[#5B2D8E]'
            : 'border-gray-200 text-gray-700 hover:border-gray-300',
        )}
      >
        Filter
        {isFiltered && (
          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#EEEDFE] text-[#5B2D8E] text-[10px] font-bold">
            {letter}
          </span>
        )}
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-20"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
            By first letter
          </p>
          <div className="grid grid-cols-7 gap-1">
            <button
              type="button"
              onClick={() => {
                onLetterChange('all')
                setOpen(false)
              }}
              className={cn(
                'col-span-2 inline-flex items-center justify-center h-8 px-2 rounded text-xs font-semibold transition-colors',
                letter === 'all'
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-50',
              )}
            >
              All
            </button>
            {ALPHABET.map((ch) => {
              const count = lettersWithCounts.get(ch) ?? 0
              const isActive = letter === ch
              const disabled = count === 0
              return (
                <button
                  key={ch}
                  type="button"
                  disabled={disabled}
                  onClick={() => {
                    onLetterChange(ch)
                    setOpen(false)
                  }}
                  title={
                    disabled
                      ? `No ${ch} vendors`
                      : `${count} starting with ${ch}`
                  }
                  className={cn(
                    'inline-flex items-center justify-center h-8 rounded text-xs font-semibold transition-colors',
                    isActive && 'bg-gray-900 text-white',
                    !isActive &&
                      !disabled &&
                      'text-gray-700 hover:bg-gray-50',
                    disabled && 'text-gray-300 cursor-not-allowed',
                  )}
                >
                  {ch}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function EmptyState({
  search,
  letter,
  totalInStatus,
}: {
  search: string
  letter: string
  totalInStatus: number
}) {
  const filtered = search.trim() || letter !== 'all'
  return (
    <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[#EEEDFE] text-[#5B2D8E] flex items-center justify-center mx-auto">
        <Building2 className="w-6 h-6" strokeWidth={1.6} />
      </div>
      <p className="text-sm font-semibold text-gray-700 mt-4">
        {filtered
          ? 'No vendors match those filters.'
          : totalInStatus === 0
            ? 'No vendors in this status'
            : 'Nothing here.'}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {filtered
          ? 'Clear the search or pick a different letter.'
          : 'When vendors hit this state, they’ll appear here.'}
      </p>
    </div>
  )
}
