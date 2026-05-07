// OF-ADM-EDITORIAL-001 — shared status pill, used across Authors, Articles,
// and Submissions tabs. Single visual grammar across the three tabs is the
// whole point of this component existing.

import { cn } from '@/lib/utils'

export type StatusVariant =
  | 'active'
  | 'pending'
  | 'revisions'
  | 'approved'
  | 'published'
  | 'scheduled'
  | 'draft'
  | 'inactive'
  | 'rejected'
  | 'expired'
  | 'revoked'

const STYLES: Record<StatusVariant, { wrap: string; label: string }> = {
  active: { wrap: 'bg-emerald-50 text-emerald-800', label: 'Active' },
  approved: { wrap: 'bg-emerald-50 text-emerald-800', label: 'Approved' },
  published: { wrap: 'bg-emerald-50 text-emerald-800', label: 'Published' },
  pending: { wrap: 'bg-amber-50 text-amber-800', label: 'Pending' },
  revisions: { wrap: 'bg-rose-50 text-rose-700', label: 'Revisions' },
  scheduled: { wrap: 'bg-sky-50 text-sky-800', label: 'Scheduled' },
  draft: { wrap: 'bg-gray-100 text-gray-600', label: 'Draft' },
  inactive: { wrap: 'bg-gray-100 text-gray-600', label: 'Inactive' },
  rejected: { wrap: 'bg-rose-50 text-rose-700', label: 'Rejected' },
  expired: { wrap: 'bg-gray-100 text-gray-600', label: 'Expired' },
  revoked: { wrap: 'bg-rose-50 text-rose-700', label: 'Revoked' },
}

export default function StatusPill({
  variant,
  label,
  className,
}: {
  variant: StatusVariant
  label?: string
  className?: string
}) {
  const style = STYLES[variant]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
        style.wrap,
        className
      )}
    >
      {label ?? style.label}
    </span>
  )
}
