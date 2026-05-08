'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Calendar, MapPin, ChevronRight } from 'lucide-react'

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
  // Date-only strings (YYYY-MM-DD) are UTC; parse parts to avoid timezone shift
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(iso)
  const d = dateOnly
    ? new Date(`${iso}T00:00:00`)
    : new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: dateOnly ? 'UTC' : undefined })
}

export default function InquiriesClient({ initialEmail, initialInquiries }: Props) {
  const [inquiries] = useState<InquirySummary[] | null>(initialInquiries ?? null)

  return (
    <div className="py-8 px-4 sm:px-8 max-w-2xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1A1A1A] tracking-tight">Your Inquiries</h1>
        {initialEmail ? (
          <p className="text-sm text-gray-400 mt-1">
            Showing quote requests linked to <span className="font-semibold text-[#1A1A1A]">{initialEmail}</span>
          </p>
        ) : (
          <p className="text-sm text-gray-400 mt-1">
            Track all your vendor conversations and quote requests.
          </p>
        )}
      </div>

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
                You haven&apos;t sent any quote requests yet. Browse vendors to get started.
              </p>
              <Link
                href="/vendors"
                className="inline-flex items-center gap-2 mt-5 bg-(--accent) text-(--on-accent) px-5 py-2.5 rounded-full text-sm font-bold hover:bg-(--accent-hover) transition-colors"
              >
                Browse vendors
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                {inquiries.length} {inquiries.length === 1 ? 'request' : 'requests'}
              </p>
              <ul className="space-y-3">
                {inquiries.map(inq => (
                  <li key={inq.id}>
                    <Link
                      href={`/my/inquiries/${inq.id}`}
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

      {/* Empty state before data loads */}
      {inquiries === null && (
        <div className="text-center py-16 text-gray-300">
          <MessageCircle className="w-10 h-10 mx-auto mb-3" />
          <p className="text-sm text-gray-400">No inquiry data available.</p>
        </div>
      )}
    </div>
  )
}
