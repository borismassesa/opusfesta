'use client'

import { useState, useTransition } from 'react'
import { updateInquiryStatus, type InquiryStatus } from './actions'

// Inline status dropdown in the bookings table. Disables during the server
// action; on failure, surfaces an inline error so the click isn't silently
// dropped. On success, revalidation re-fetches with the new state.

const STATUSES: readonly InquiryStatus[] = [
  'pending',
  'responded',
  'accepted',
  'declined',
  'closed',
]

const STATUS_TONE: Record<InquiryStatus, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  responded: 'border-sky-200 bg-sky-50 text-sky-700',
  accepted: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  declined: 'border-rose-200 bg-rose-50 text-rose-700',
  closed: 'border-gray-200 bg-gray-50 text-gray-500',
}

const STATUS_LABEL: Record<InquiryStatus, string> = {
  pending: 'Pending',
  responded: 'Responded',
  accepted: 'Accepted',
  declined: 'Declined',
  closed: 'Closed',
}

export default function StatusCell({
  inquiryId,
  status,
  canEdit,
}: {
  inquiryId: string
  status: InquiryStatus
  canEdit: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!canEdit) {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_TONE[status]}`}
      >
        {STATUS_LABEL[status]}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      <select
        value={status}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value
          setError(null)
          start(async () => {
            try {
              await updateInquiryStatus(inquiryId, next)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not update status.')
            }
          })
        }}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider focus:outline-none disabled:opacity-60 ${STATUS_TONE[status]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && (
        <p role="alert" className="text-[10px] text-rose-600">
          {error}
        </p>
      )}
    </div>
  )
}
