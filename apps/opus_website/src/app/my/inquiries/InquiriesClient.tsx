'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Calendar, MapPin, ChevronRight, Search, X } from 'lucide-react'

type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed'

type InquirySummary = {
  id: string
  vendor_name: string | null
  vendor_slug: string | null
  status: InquiryStatus | null
  created_at: string
  event_date: string | null
  location: string | null
  guest_count: number | null
}

type Props = {
  initialEmail?: string | null
  initialInquiries?: InquirySummary[] | null
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending:   'Pending reply',
  responded: 'Replied',
  accepted:  'Accepted',
  declined:  'Declined',
  closed:    'Closed',
}

const STATUS_STYLE: Record<InquiryStatus, string> = {
  pending:   'bg-amber-50 text-amber-700',
  responded: 'bg-blue-50 text-blue-700',
  accepted:  'bg-emerald-50 text-emerald-700',
  declined:  'bg-red-50 text-red-600',
  closed:    'bg-gray-100 text-gray-500',
}

function StatusBadge({ status }: Readonly<{ status: InquiryStatus | null }>) {
  const s = status ?? 'pending'
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_STYLE[s]}`}>
      {STATUS_LABEL[s]}
    </span>
  )
}

function formatDate(iso: string) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Wrapper to isolate useSearchParams inside a Suspense boundary
function SearchParamsReader({
  onParams,
}: {
  onParams: (email: string | null) => void
}) {
  const searchParams = useSearchParams()
  useEffect(() => {
    onParams(searchParams.get('email'))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

export default function InquiriesClient({ initialEmail, initialInquiries }: Props) {
  const [email, setEmail] = useState(initialEmail ?? '')
  const [submittedEmail, setSubmittedEmail] = useState(initialEmail ?? '')
  const [inquiries, setInquiries] = useState<InquirySummary[] | null>(initialInquiries ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showSearch, setShowSearch] = useState(!initialEmail)

  // When no initial data, read search params and sessionStorage
  useEffect(() => {
    if (initialEmail) return
    const stored = sessionStorage.getItem('of_inquiry_email')
    if (stored) setEmail(stored)
  }, [initialEmail])

  async function handleSearch(e: React.SyntheticEvent) {
    e.preventDefault()
    const trimmed = email.trim().toLowerCase()
    if (!trimmed) return

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/my/inquiries?email=${encodeURIComponent(trimmed)}`)
      const json = await res.json()
      if (res.ok) {
        sessionStorage.setItem('of_inquiry_email', trimmed)
        setSubmittedEmail(trimmed)
        setInquiries(json.inquiries)
        setShowSearch(false)
      } else {
        setError(json.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const hasPreloaded = !!initialEmail && initialInquiries !== null

  return (
    <div className="py-8 px-4 sm:px-8 max-w-2xl">
      <Suspense>
        <SearchParamsReader
          onParams={(urlEmail) => {
            if (!initialEmail && urlEmail) setEmail(urlEmail)
          }}
        />
      </Suspense>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Your Inquiries</h1>
        {hasPreloaded ? (
          <p className="text-sm text-gray-400 mt-1">
            Showing quote requests linked to <span className="font-semibold text-[#1A1A1A]">{initialEmail}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            Track all your vendor conversations and quote requests.
          </p>
        )}
      </div>

      {/* Search toggle */}
      {hasPreloaded && (
        <div className="mb-6">
          {!showSearch ? (
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="text-xs font-semibold text-gray-400 hover:text-[#1A1A1A] transition-colors flex items-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              Search by a different email
            </button>
          ) : (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-600">Search by email</p>
                <button type="button" onClick={() => setShowSearch(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-[#1A1A1A]" />
                </button>
              </div>
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="different@email.com"
                    required
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-(--accent) transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-(--accent) font-semibold text-sm text-(--on-accent) hover:bg-(--accent-hover) disabled:opacity-60 transition-colors"
                >
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Primary email search (no pre-loaded data) */}
      {!hasPreloaded && (
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-(--accent) transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-3 rounded-xl bg-(--accent) font-semibold text-sm text-(--on-accent) hover:bg-(--accent-hover) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-red-600 rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-6">
          {error}
        </p>
      )}

      {/* Results */}
      {inquiries !== null && (
        <>
          {inquiries.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="font-semibold text-[#1A1A1A] mb-2">No requests found</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">
                {hasPreloaded
                  ? "You haven't sent any quote requests yet. Browse vendors to get started."
                  : `No requests found for ${submittedEmail}. Check you used the exact email from the vendor contact form.`}
              </p>
              {hasPreloaded && (
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 mt-5 bg-(--accent) text-(--on-accent) px-5 py-2.5 rounded-full text-sm font-bold hover:bg-(--accent-hover) transition-colors"
                >
                  Browse vendors
                  <ChevronRight className="w-4 h-4" />
                </Link>
              )}
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                {inquiries.length} {inquiries.length === 1 ? 'request' : 'requests'}
                {submittedEmail && !hasPreloaded ? ` for ${submittedEmail}` : ''}
              </p>
              <ul className="space-y-3">
                {inquiries.map(inq => (
                  <li key={inq.id}>
                    <Link
                      href={`/my/inquiries/${inq.id}?email=${encodeURIComponent(submittedEmail || initialEmail || '')}`}
                      className="flex items-start justify-between gap-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:border-(--accent)/30 hover:shadow-md transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <h3 className="font-bold text-[#1A1A1A] truncate text-sm">
                            {inq.vendor_name ?? inq.vendor_slug ?? 'Vendor'}
                          </h3>
                          <StatusBadge status={inq.status} />
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                          {inq.event_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(inq.event_date)}
                            </span>
                          )}
                          {inq.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {inq.location}
                            </span>
                          )}
                          <span className="text-gray-300">Sent {formatDate(inq.created_at)}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-(--accent) transition-colors shrink-0 mt-0.5" />
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* Empty state before any search */}
      {inquiries === null && !loading && (
        <div className="text-center py-16 text-gray-300">
          <MessageCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Enter your email above to track your quote requests.</p>
        </div>
      )}
    </div>
  )
}
