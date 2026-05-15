'use client'

import { useTransition } from 'react'
import { updateLeadStatus } from './actions'

// Inline status dropdown in the table. Optimistically disables while
// the server action runs; revalidation happens on the action side so
// the page re-fetches with the new state.

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
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value
        start(async () => {
          try {
            await updateLeadStatus(leadId, next)
          } catch (err) {
            // Soft failure — log and let the user retry. The select
            // re-renders with the server's truth on revalidation.
            console.warn('[partnerships] status update failed:', err)
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
  )
}
