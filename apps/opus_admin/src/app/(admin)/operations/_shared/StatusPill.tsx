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

const STYLES: Record<
  StatusVariant,
  { wrap: string; dot: string; label: string }
> = {
  active: {
    wrap: 'bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Active',
  },
  approved: {
    wrap: 'bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Approved',
  },
  published: {
    wrap: 'bg-emerald-50 text-emerald-800',
    dot: 'bg-emerald-500',
    label: 'Published',
  },
  pending: {
    wrap: 'bg-amber-50 text-amber-800',
    dot: 'bg-amber-500',
    label: 'Pending',
  },
  revisions: {
    wrap: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    label: 'Revisions',
  },
  scheduled: {
    wrap: 'bg-sky-50 text-sky-800',
    dot: 'bg-sky-500',
    label: 'Scheduled',
  },
  draft: {
    wrap: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    label: 'Draft',
  },
  inactive: {
    wrap: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    label: 'Inactive',
  },
  rejected: {
    wrap: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    label: 'Rejected',
  },
  expired: {
    wrap: 'bg-gray-100 text-gray-600',
    dot: 'bg-gray-400',
    label: 'Expired',
  },
  revoked: {
    wrap: 'bg-rose-50 text-rose-700',
    dot: 'bg-rose-500',
    label: 'Revoked',
  },
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
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
        style.wrap,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} />
      {label ?? style.label}
    </span>
  )
}
