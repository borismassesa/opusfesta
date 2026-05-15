'use client'

import { useState, useTransition } from 'react'
import { updateLeadStatus } from './actions'

// Inline status dropdown in the table. Disables during the server
// action; on failure, snaps the select back to the original value
// and shows an inline error so the user knows the click didn't take.
// On success, revalidation re-fetches with the new state.

const STATUSES = ['New', 'Contacted', 'Negotiating', 'Closed Won', 'Closed Lost'] as const

const STATUS_TONE: Record<(typeof STATUSES)[number], string> = {
  New: 'border-sky-200 bg-sky-50 text-sky-700',
  Contacted: 'border-amber-200 bg-amber-50 text-amber-700',
  Negotiating: 'border-purple-200 bg-purple-50 text-purple-700',
  'Closed Won': 'border-emerald-200 bg-emerald-50 text-emerald-700',
  'Closed Lost': 'border-gray-200 bg-gray-50 text-gray-500',
}

export default function StatusCell({
  leadId,
  status,
  canEdit,
}: {
  leadId: string
  status: (typeof STATUSES)[number]
  canEdit: boolean
}) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  if (!canEdit) {
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${STATUS_TONE[status]}`}
      >
        {status}
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
              await updateLeadStatus(leadId, next)
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Could not update status.')
              // The select keeps showing `next` until the page revalidates
              // and rerenders with server truth. Pairing the error message
              // below makes the failure obvious instead of silent.
            }
          })
        }}
        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider focus:outline-none disabled:opacity-60 ${STATUS_TONE[status]}`}
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
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
