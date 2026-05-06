// OF-ADM-AUTHORS-001 — owns search + filter state and feeds AuthorsTable.
// Kept as one client component (not a per-input wrapper) so the search box
// can live in the page header without a context provider just for two
// strings and a string-or-null.

'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import AuthorsFilterBar from './AuthorsFilterBar'
import AuthorsTable from './AuthorsTable'
import type { AuthorListEntry } from './types'

type Props = {
  authors: Extract<AuthorListEntry, { kind: 'author' }>[]
  invites: Extract<AuthorListEntry, { kind: 'invite' }>[]
}

export default function AuthorsListView({ authors, invites }: Props) {
  const [searchInput, setSearchInput] = useState('')
  // useDeferredValue gives us a debounced-ish filter without a setTimeout —
  // React keeps the input responsive while the filtered list catches up.
  const search = useDeferredValue(searchInput).trim()
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all')

  const roles = useMemo(() => {
    const set = new Set<string>()
    for (const a of authors) if (a.role) set.add(a.role)
    for (const i of invites) if (i.role) set.add(i.role)
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [authors, invites])

  const reorderEnabled = !search && !roleFilter && statusFilter === 'all'

  return (
    <div className="space-y-4">
      <AuthorsFilterBar
        roles={roles}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
        onRoleChange={setRoleFilter}
        onStatusChange={setStatusFilter}
        reorderEnabled={reorderEnabled}
        searchSlot={
          <div className="relative w-[220px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search authors"
              aria-label="Search authors"
              className="h-9 w-full rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </div>
        }
      />

      <AuthorsTable
        authors={authors}
        invites={invites}
        search={search}
        roleFilter={roleFilter}
        statusFilter={statusFilter}
      />
    </div>
  )
}
