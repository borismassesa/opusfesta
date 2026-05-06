// OF-ADM-AUTHORS-001 — role + status filter row that sits above the table.
// Mirrors the Articles + Submissions filter strips so the three editorial
// tabs share one visual grammar. Search leads, filters follow, the
// "Drag to reorder" hint is right-pinned via `ml-auto`.

'use client'

import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { COMPACT_SELECT_CLS } from '../../_shared/filterControls'

type Props = {
  roles: string[]
  roleFilter: string | null
  statusFilter: 'all' | 'active' | 'pending'
  onRoleChange: (next: string | null) => void
  onStatusChange: (next: 'all' | 'active' | 'pending') => void
  reorderEnabled: boolean
  searchSlot?: React.ReactNode
}

export default function AuthorsFilterBar({
  roles,
  roleFilter,
  statusFilter,
  onRoleChange,
  onStatusChange,
  reorderEnabled,
  searchSlot,
}: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {searchSlot && (
        <div className="min-w-[180px] flex-1 sm:max-w-[240px]">{searchSlot}</div>
      )}
      <select
        value={roleFilter ?? ''}
        onChange={(e) => onRoleChange(e.target.value || null)}
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by role"
      >
        <option value="">Role: All</option>
        {roles.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) =>
          onStatusChange(e.target.value as 'all' | 'active' | 'pending')
        }
        className={COMPACT_SELECT_CLS}
        aria-label="Filter by status"
      >
        <option value="all">Status: All</option>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
      </select>

      <span
        className={cn(
          'ml-auto inline-flex items-center gap-1.5 text-xs font-medium',
          reorderEnabled ? 'text-gray-500' : 'text-gray-300'
        )}
        title={
          reorderEnabled
            ? 'Drag a row by its handle to change publishing order'
            : 'Clear filters and search to enable reorder'
        }
      >
        <GripVertical className="h-3.5 w-3.5" />
        Drag to reorder
      </span>
    </div>
  )
}
