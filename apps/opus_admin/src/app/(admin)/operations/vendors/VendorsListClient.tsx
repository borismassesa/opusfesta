'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  AlertCircle,
  Building2,
  ChevronDown,
  Loader2,
  Plus,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { cn } from '@/lib/utils'
import { useSetPageHeading } from '@/components/PageHeading'
import { useSetPageSearch } from '@/components/PageSearch'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import { QueueHealthStrip } from './_components/QueueHealthStrip'
import { VendorRowCard } from './_components/VendorRowCard'
import { createVendorAccount } from './actions'
import type {
  QueueHealth,
  VendorAccount,
  VendorStatus,
  VendorStatusCounts,
} from './_lib/types'

const NEW_VENDOR_CATEGORIES = [
  'Venues',
  'Photographers',
  'Videographers',
  'Caterers',
  'Wedding Planners',
  'Florists',
  'DJs & Music',
  'Beauty & Makeup',
  'Bridal Salons',
  'Cake & Desserts',
  'Decorators',
  'Officiants',
  'Rentals',
  'Transportation',
] as const

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

  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="px-8 pt-4 pb-12">
      {/* Create vendor CTA — portaled into the global Header so it sits
          next to the help/bell icons, matching the pattern used on the
          vendor review page. */}
      <HeaderActionsSlot>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full bg-[#7E5896] hover:bg-[#6B4880] text-white shadow-sm transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
          New vendor
        </button>
      </HeaderActionsSlot>

      <CreateVendorDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          setCreateOpen(false)
          router.push(`/operations/vendors/${id}`)
        }}
      />

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

// ---------------------------------------------------------------------------
// Create vendor dialog
//
// Admin spins up a vendor row directly with the bare minimum (business
// name, category, contact email). Status starts at
// `application_in_progress` so the admin can fill in everything else
// (address, packages, photos, etc.) via the existing per-section editors
// on the review page. The contact email also creates a placeholder
// `users` row — when the real vendor signs in with the matching email,
// they pick up the existing membership and storefront.
// ---------------------------------------------------------------------------

function CreateVendorDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: (vendorId: string) => void
}) {
  const [businessName, setBusinessName] = useState('')
  const [category, setCategory] = useState<string>('')
  const [contactEmail, setContactEmail] = useState('')
  const [city, setCity] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // Reset the form whenever the dialog opens so reopening doesn't show
  // stale input from the previous attempt.
  useEffect(() => {
    if (!open) return
    setBusinessName('')
    setCategory('')
    setContactEmail('')
    setCity('')
    setPhone('')
    setBio('')
    setError(null)
  }, [open])

  // Close on Esc — small affordance, no library needed.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !pending) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, pending, onClose])

  if (!open) return null

  const submit = () => {
    setError(null)
    startTransition(async () => {
      const res = await createVendorAccount({
        businessName,
        category,
        contactEmail,
        city: city || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
      })
      if (!res.ok) {
        setError(res.error)
        return
      }
      onCreated(res.vendorId)
    })
  }

  const valid =
    businessName.trim().length > 1 &&
    category.length > 0 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(contactEmail.trim())

  const fieldCls =
    'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7E5896]/30 focus:border-[#7E5896]/40'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="create-vendor-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !pending) onClose()
      }}
    >
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-lg">
        <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-3 border-b border-gray-100">
          <div>
            <h2
              id="create-vendor-title"
              className="text-base font-semibold text-gray-900"
            >
              New vendor account
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Fill in the basics. You can complete the storefront (packages,
              photos, hours) on the review page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="text-gray-400 hover:text-gray-700 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-3">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2">
              <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <p className="text-xs text-rose-800 leading-relaxed">{error}</p>
            </div>
          )}

          <FormField label="Business name">
            <input
              autoFocus
              className={fieldCls}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Bahari Catering"
            />
          </FormField>

          <FormField label="Category">
            <select
              className={fieldCls}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Select a category…</option>
              {NEW_VENDOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Contact email">
            <input
              type="email"
              className={fieldCls}
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="owner@example.co.tz"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              The vendor claims the account when they sign in with this email.
            </p>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="City (optional)">
              <input
                className={fieldCls}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Dar es Salaam"
              />
            </FormField>
            <FormField label="Phone (optional)">
              <input
                className={fieldCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+255 7XX XXX XXX"
              />
            </FormField>
          </div>

          <FormField label="Short bio (optional)">
            <textarea
              rows={2}
              className={fieldCls}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="One sentence about the vendor — couples see this on the listing card."
            />
          </FormField>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="text-sm font-semibold px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!valid || pending}
            className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-lg bg-[#7E5896] hover:bg-[#6B4880] text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {pending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Creating…
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Create vendor
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
