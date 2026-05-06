'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Calendar, MapPin, ChevronRight, Search } from 'lucide-react'

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

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: 'Pending reply',
  responded: 'Replied',
  accepted: 'Accepted',
  declined: 'Declined',
  closed: 'Closed',
}

const STATUS_STYLE: Record<InquiryStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  responded: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  declined: 'bg-red-50 text-red-600',
  closed: 'bg-gray-100 text-gray-500',
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

export default function MyInquiriesPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [inquiries, setInquiries] = useState<InquirySummary[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-populate email from sessionStorage if previously searched
  useEffect(() => {
    const fromUrl = searchParams.get('email')?.trim().toLowerCase() ?? ''
    const stored = sessionStorage.getItem('of_inquiry_email')
    if (fromUrl) {
      setEmail(fromUrl)
      return
    }
    if (stored) setEmail(stored)
  }, [searchParams])

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
      } else {
        setError(json.error ?? 'Something went wrong. Please try again.')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A] tracking-tight">Your quote requests</h1>
          <p className="text-gray-500 mt-1.5 text-sm">
            Enter the email address you used when filling in a quote request to see all your vendor conversations.
          </p>
        </div>

        {/* Email search form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-(--accent) transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="shrink-0 px-5 py-3 rounded-xl bg-(--accent) font-semibold text-sm text-[#1A1A1A] hover:bg-(--accent-hover) disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Searching…' : 'Search'}
          </button>
        </form>

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
                <p className="font-semibold text-[#1A1A1A] mb-1">No requests found</p>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  No quote requests were found for <strong>{submittedEmail}</strong>. Make sure you use the exact email you entered on the vendor contact form.
                </p>
              </div>
            ) : (
              <>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400 mb-3">
                  {inquiries.length} {inquiries.length === 1 ? 'request' : 'requests'} for {submittedEmail}
                </p>
                <ul className="space-y-3">
                  {inquiries.map((inq) => (
                    <li key={inq.id}>
                      <Link
                        href={`/my/inquiries/${inq.id}?email=${encodeURIComponent(submittedEmail)}`}
                        className="flex items-start justify-between gap-3 bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:border-(--accent)/40 hover:shadow-md transition-all group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <h3 className="font-semibold text-[#1A1A1A] truncate">
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
                            <span className="text-gray-300">
                              Sent {formatDate(inq.created_at)}
                            </span>
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

        {/* Empty state before search */}
        {inquiries === null && !loading && (
          <div className="text-center py-16 text-gray-300">
            <MessageCircle className="w-10 h-10 mx-auto mb-3" />
            <p className="text-sm text-gray-400">Enter your email above to track your quote requests.</p>
          </div>
        )}
      </div>
    </div>
  )
}
