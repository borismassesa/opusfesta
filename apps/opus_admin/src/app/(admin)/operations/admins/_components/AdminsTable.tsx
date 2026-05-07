'use client'

import { useMemo, useState, useTransition } from 'react'
import { Plus, ShieldCheck, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  addAdmin,
  removeAdmin,
  setAdminActive,
  updateAdminRole,
  type AdminWhitelistRow,
} from '../actions'

const SELECTABLE_ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
  { value: 'author', label: 'Author' },
] as const

const ROLE_PILL: Record<
  AdminWhitelistRow['role'],
  { label: string; className: string }
> = {
  owner: { label: 'Owner', className: 'bg-[#F0DFF6] text-[#5B2D8E]' },
  admin: { label: 'Admin', className: 'bg-[#E5F2FB] text-[#1F5D8C]' },
  editor: { label: 'Editor', className: 'bg-[#FFF3D9] text-[#6E4A00]' },
  viewer: { label: 'Viewer', className: 'bg-gray-100 text-gray-700' },
  author: { label: 'Author', className: 'bg-[#FCE8F0] text-[#A11461]' },
}

export default function AdminsTable({
  admins,
  callerEmail,
  callerIsOwner,
}: {
  admins: AdminWhitelistRow[]
  callerEmail: string | null
  callerIsOwner: boolean
}) {
  const [search, setSearch] = useState('')
  const [adding, setAdding] = useState(false)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return admins
    return admins.filter(
      (a) =>
        a.email.toLowerCase().includes(q) ||
        (a.full_name?.toLowerCase().includes(q) ?? false) ||
        a.role.toLowerCase().includes(q)
    )
  }, [admins, search])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <input
          type="search"
          placeholder="Search by email, name or role…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
        />
        {callerIsOwner && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b97fd0]"
          >
            <Plus className="h-4 w-4" />
            Add admin
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div
          role="row"
          className="grid grid-cols-[minmax(0,1fr)_140px_120px_110px] items-center gap-3 border-b border-gray-100 bg-gray-50/60 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-gray-500"
        >
          <span>Member</span>
          <span>Role</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        {visible.length === 0 ? (
          <EmptyState />
        ) : (
          visible.map((row) => (
            <AdminRow
              key={row.id}
              row={row}
              callerEmail={callerEmail}
              callerIsOwner={callerIsOwner}
            />
          ))
        )}
      </div>

      {adding && callerIsOwner && (
        <AddAdminDialog onClose={() => setAdding(false)} />
      )}
    </div>
  )
}

function AdminRow({
  row,
  callerEmail,
  callerIsOwner,
}: {
  row: AdminWhitelistRow
  callerEmail: string | null
  callerIsOwner: boolean
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const isSelf = callerEmail === row.email
  // Owners can manage everyone, including other owners. The only guards
  // (enforced server-side, mirrored here so disabled controls explain why)
  // are: don't let an owner remove or disable themselves — that would lock
  // them out of this very page.
  const canEditRole = callerIsOwner
  const canToggleActive = callerIsOwner && !isSelf
  const canRemove = callerIsOwner && !isSelf

  const pill = ROLE_PILL[row.role]

  function changeRole(next: string) {
    setError(null)
    startTransition(async () => {
      try {
        await updateAdminRole(row.id, next)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update role.')
      }
    })
  }

  function toggleActive() {
    setError(null)
    startTransition(async () => {
      try {
        await setAdminActive(row.id, !row.is_active)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not change status.')
      }
    })
  }

  function deleteRow() {
    if (!window.confirm(`Remove ${row.email} from the admin team?`)) return
    setError(null)
    startTransition(async () => {
      try {
        await removeAdmin(row.id)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not remove admin.')
      }
    })
  }

  return (
    <div
      role="row"
      className={cn(
        'grid grid-cols-[minmax(0,1fr)_140px_120px_110px] items-center gap-3 border-b border-gray-100 px-4 py-3.5 last:border-b-0',
        !row.is_active && 'opacity-60',
        pending && 'pointer-events-none opacity-70'
      )}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-950">
          {row.full_name || row.email.split('@')[0]}
          {isSelf && (
            <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-[#7E5896]">
              You
            </span>
          )}
        </p>
        <p className="truncate text-xs text-gray-500">{row.email}</p>
        {error && (
          <p className="mt-1 truncate text-xs font-medium text-rose-700">{error}</p>
        )}
      </div>

      <div>
        {canEditRole ? (
          <select
            value={row.role}
            onChange={(e) => changeRole(e.target.value)}
            disabled={pending}
            className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
          >
            {SELECTABLE_ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={cn(
              'inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
              pill.className
            )}
          >
            {pill.label}
          </span>
        )}
      </div>

      <div>
        {canToggleActive ? (
          <button
            type="button"
            onClick={toggleActive}
            disabled={pending}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors',
              row.is_active
                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            )}
          >
            {row.is_active ? 'Active' : 'Disabled'}
          </button>
        ) : (
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider',
              row.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700'
            )}
          >
            {row.is_active ? 'Active' : 'Disabled'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        {canRemove && (
          <button
            type="button"
            onClick={deleteRow}
            disabled={pending}
            aria-label={`Remove ${row.email}`}
            title="Remove from admin team"
            className="rounded-md p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-700"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}

function AddAdminDialog({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<string>('admin')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        await addAdmin({ email, fullName, role })
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not add admin.')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-admin-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2
          id="add-admin-title"
          className="text-lg font-semibold text-gray-900"
        >
          Add to admin team
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          The person can access the admin dashboard the next time they sign in.
        </p>

        <div className="mt-4 space-y-3">
          <Field label="Email">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="person@example.com"
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </Field>
          <Field label="Display name (optional)">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Their full name"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </Field>
          <Field label="Role">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            >
              {SELECTABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {error && <p className="mt-3 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || !email}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b97fd0] disabled:opacity-50"
          >
            {pending ? 'Adding…' : 'Add admin'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F0DFF6] text-[#7E5896]">
        <ShieldCheck className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-gray-900">No admins found</p>
      <p className="mt-1 text-sm text-gray-500">
        Adjust the search, or add a new admin.
      </p>
    </div>
  )
}
