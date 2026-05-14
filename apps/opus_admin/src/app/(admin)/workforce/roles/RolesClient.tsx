'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  Check,
  Lock,
  Pencil,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Avatar from '../_components/Avatar'
import StatusPill from '../_components/StatusPill'
import Kpi, { KpiRow } from '../_components/Kpi'
import type { Employee, Permission, PermissionGroup, WorkforceRole } from '../_lib/data'
import { createRole, deleteRole, setRoleMembers, updateRolePermissions } from './actions'

export default function RolesClient({
  roles,
  permissions,
  employees,
  memberIdsByRole,
}: {
  roles: WorkforceRole[]
  permissions: Permission[]
  employees: Employee[]
  memberIdsByRole: Record<string, string[]>
}) {
  const [selectedId, setSelectedId] = useState<string>(roles[0]?.id ?? '')
  const selected = roles.find((r) => r.id === selectedId) ?? roles[0]
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<WorkforceRole | null>(null)
  const [deleting, setDeleting] = useState<WorkforceRole | null>(null)
  const [assigning, setAssigning] = useState<WorkforceRole | null>(null)

  const employeesById = useMemo(
    () => new Map(employees.map((e) => [e.id, e] as const)),
    [employees],
  )

  const groups = useMemo(() => {
    const map = new Map<PermissionGroup, Permission[]>()
    for (const p of permissions) {
      const list = map.get(p.group) ?? []
      list.push(p)
      map.set(p.group, list)
    }
    return Array.from(map.entries())
  }, [permissions])

  const totalMembers = roles.reduce((s, r) => s + r.members, 0)
  const systemRoles = roles.filter((r) => r.isSystem).length

  return (
    <div className="space-y-6">
      <KpiRow>
        <Kpi label="Roles" value={String(roles.length)} hint={`${systemRoles} system · ${roles.length - systemRoles} custom`} icon={<Shield className="h-4 w-4" />} />
        <Kpi label="Members assigned" value={String(totalMembers)} hint="across all roles" icon={<Users className="h-4 w-4" />} />
        <Kpi label="Permissions" value={String(permissions.length)} hint={`${groups.length} groups`} icon={<ShieldCheck className="h-4 w-4" />} />
        <Kpi label="MFA enforced" value="100%" delta="All admins" deltaTone="positive" icon={<Lock className="h-4 w-4" />} />
      </KpiRow>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-500">All roles</h3>
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="inline-flex items-center gap-1 rounded-md bg-[#C9A0DC] px-2 py-1 text-xs font-semibold text-white hover:bg-[#b97fd0]"
              >
                <Plus className="h-3 w-3" />
                New
              </button>
            </div>
            <div className="mt-3 space-y-1">
              {roles.map((r) => {
                const active = r.id === selectedId
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedId(r.id)}
                    className={cn(
                      'w-full rounded-xl px-3 py-3 text-left transition-colors',
                      active ? 'bg-[#F0DFF6]' : 'hover:bg-gray-50',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className={cn('text-sm font-semibold', active ? 'text-[#5B2D8E]' : 'text-gray-900')}>{r.name}</p>
                      {r.isSystem ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                          <Lock className="h-2.5 w-2.5" />
                          System
                        </span>
                      ) : (
                        <StatusPill tone="purple" label="Custom" />
                      )}
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-500">{r.description}</p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      {r.members} member{r.members === 1 ? '' : 's'} · {r.permissionKeys.length} permissions
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {selected && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold tracking-tight text-gray-900">{selected.name}</h2>
                    {selected.isSystem ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gray-600">
                        <Lock className="h-2.5 w-2.5" />
                        System role
                      </span>
                    ) : (
                      <StatusPill tone="purple" label="Custom role" />
                    )}
                  </div>
                  <p className="mt-1 max-w-xl text-sm text-gray-600">{selected.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!selected.isSystem && (
                    <button
                      type="button"
                      onClick={() => setDeleting(selected)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setAssigning(selected)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <Users className="h-4 w-4" />
                    Assign members
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(selected)}
                    disabled={selected.isSystem}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b97fd0] disabled:cursor-not-allowed disabled:opacity-50"
                    title={selected.isSystem ? 'System roles are locked' : 'Edit permissions'}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit permissions
                  </button>
                </div>
              </div>
            </div>

            <MembersCard
              role={selected}
              memberIds={memberIdsByRole[selected.id] ?? []}
              employeesById={employeesById}
              onAssign={() => setAssigning(selected)}
            />

            <PermissionMatrix groups={groups} role={selected} />
          </div>
        )}
      </div>

      {showCreate && (
        <RoleFormDialog
          mode="create"
          groups={groups}
          onClose={() => setShowCreate(false)}
        />
      )}
      {editing && (
        <RoleFormDialog
          mode="edit"
          groups={groups}
          role={editing}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteRoleDialog role={deleting} onClose={() => setDeleting(null)} />
      )}
      {assigning && (
        <AssignMembersDialog
          role={assigning}
          employees={employees}
          currentMemberIds={memberIdsByRole[assigning.id] ?? []}
          onClose={() => setAssigning(null)}
        />
      )}
    </div>
  )
}

function MembersCard({
  role,
  memberIds,
  employeesById,
  onAssign,
}: {
  role: WorkforceRole
  memberIds: string[]
  employeesById: Map<string, Employee>
  onAssign: () => void
}) {
  const members = memberIds
    .map((id) => employeesById.get(id))
    .filter((e): e is Employee => Boolean(e))

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Members</h3>
          <p className="text-xs text-gray-500">
            {members.length} {members.length === 1 ? 'person holds' : 'people hold'} the{' '}
            <span className="font-semibold text-gray-700">{role.name}</span> role.
          </p>
        </div>
        <button
          type="button"
          onClick={onAssign}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Pencil className="h-3.5 w-3.5" />
          Manage
        </button>
      </div>
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
          <span className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F0DFF6] text-[#7E5896]">
            <Users className="h-5 w-5" />
          </span>
          <p className="text-sm font-semibold text-gray-900">No-one is in this role yet</p>
          <p className="mt-1 text-sm text-gray-500">Use "Assign members" to add people.</p>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {members.map((m) => (
            <li
              key={m.id}
              className="flex items-center justify-between gap-3 px-5 py-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={m.name} color={m.avatarColor} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">{m.name}</p>
                  <p className="truncate text-xs text-gray-500">{m.jobTitle} · {m.department}</p>
                </div>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                {m.employeeCode}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function PermissionMatrix({
  groups,
  role,
}: {
  groups: [PermissionGroup, Permission[]][]
  role: WorkforceRole
}) {
  const granted = new Set(role.permissionKeys)
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
      <div className="border-b border-gray-100 px-5 py-4">
        <h3 className="text-sm font-semibold text-gray-900">Permission matrix</h3>
        <p className="text-xs text-gray-500">
          {granted.size} of {groups.reduce((s, [, items]) => s + items.length, 0)} permissions granted.
          {role.isSystem && ' System roles are read-only.'}
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {groups.map(([groupName, items]) => {
          const groupGranted = items.filter((p) => granted.has(p.key)).length
          const allGranted = groupGranted === items.length
          return (
            <div key={groupName} className="px-5 py-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">{groupName}</h4>
                <span
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                    allGranted
                      ? 'bg-emerald-50 text-emerald-700'
                      : groupGranted === 0
                        ? 'bg-gray-100 text-gray-500'
                        : 'bg-amber-50 text-amber-700',
                  )}
                >
                  {groupGranted}/{items.length}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                {items.map((p) => {
                  const allowed = granted.has(p.key)
                  return (
                    <div
                      key={p.key}
                      className={cn(
                        'flex items-start justify-between gap-3 rounded-xl border px-3 py-3',
                        allowed
                          ? 'border-emerald-100 bg-emerald-50/40'
                          : 'border-gray-100 bg-gray-50/30',
                      )}
                    >
                      <div>
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            allowed ? 'text-emerald-800' : 'text-gray-500',
                          )}
                        >
                          {p.label}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">{p.description}</p>
                        <p className="mt-1 font-mono text-[10px] text-gray-400">{p.key}</p>
                      </div>
                      <div
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                          allowed ? 'bg-emerald-500 text-white' : 'border border-gray-200 text-gray-300',
                        )}
                      >
                        {allowed && <Check className="h-4 w-4" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Role form — handles create + edit permissions
// ---------------------------------------------------------------------------

type RoleFormProps =
  | { mode: 'create'; groups: [PermissionGroup, Permission[]][]; onClose: () => void; role?: never }
  | { mode: 'edit'; groups: [PermissionGroup, Permission[]][]; onClose: () => void; role: WorkforceRole }

function RoleFormDialog(props: RoleFormProps) {
  const isEdit = props.mode === 'edit'
  const { groups, onClose } = props
  const [name, setName] = useState(isEdit ? props.role.name : '')
  const [description, setDescription] = useState(isEdit ? props.role.description : '')
  const [granted, setGranted] = useState<Set<string>>(
    () => new Set(isEdit ? props.role.permissionKeys : []),
  )
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function toggle(key: string) {
    setGranted((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function toggleGroup(items: Permission[]) {
    setGranted((prev) => {
      const next = new Set(prev)
      const allOn = items.every((i) => next.has(i.key))
      if (allOn) {
        for (const i of items) next.delete(i.key)
      } else {
        for (const i of items) next.add(i.key)
      }
      return next
    })
  }

  function submit() {
    setError(null)
    const keys = Array.from(granted)
    startTransition(async () => {
      try {
        if (isEdit) {
          await updateRolePermissions(props.role.id, keys)
        } else {
          await createRole({
            name,
            description: description || undefined,
            permissionKeys: keys,
          })
        }
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save role.')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEdit ? `Edit ${props.role.name} permissions` : 'New role'}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {granted.size} of {groups.reduce((s, [, items]) => s + items.length, 0)} permissions selected.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-5 overflow-y-auto px-6 py-5">
          {!isEdit && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">Description</span>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="When should someone get this role?"
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
                />
              </label>
            </div>
          )}

          <div className="space-y-4">
            {groups.map(([groupName, items]) => {
              const allGranted = items.every((p) => granted.has(p.key))
              return (
                <div key={groupName} className="rounded-2xl border border-gray-100 bg-gray-50/30 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">{groupName}</h3>
                    <button
                      type="button"
                      onClick={() => toggleGroup(items)}
                      className="text-xs font-semibold text-[#7E5896] hover:underline"
                    >
                      {allGranted ? 'Clear all' : 'Select all'}
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
                    {items.map((p) => {
                      const allowed = granted.has(p.key)
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => toggle(p.key)}
                          className={cn(
                            'flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors',
                            allowed
                              ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-50'
                              : 'border-gray-200 bg-white hover:bg-gray-50',
                          )}
                        >
                          <div>
                            <p className={cn('text-sm font-semibold', allowed ? 'text-emerald-800' : 'text-gray-900')}>{p.label}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{p.description}</p>
                          </div>
                          <div
                            className={cn(
                              'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                              allowed ? 'bg-emerald-500 text-white' : 'border border-gray-300 text-gray-300',
                            )}
                          >
                            {allowed && <Check className="h-3.5 w-3.5" />}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {error && (
          <div className="border-t border-gray-100 px-6 pt-3 text-sm font-medium text-rose-700">{error}</div>
        )}

        <div className="flex justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={pending || (!isEdit && !name) || granted.size === 0}
            className="rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b97fd0] disabled:opacity-50"
          >
            {pending ? 'Saving…' : isEdit ? 'Save permissions' : 'Create role'}
          </button>
        </div>
      </div>
    </div>
  )
}

function DeleteRoleDialog({
  role,
  onClose,
}: {
  role: WorkforceRole
  onClose: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function confirm() {
    setError(null)
    startTransition(async () => {
      try {
        await deleteRole(role.id)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not delete the role.')
      }
    })
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700">
            <Trash2 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Delete {role.name}?</h2>
            <p className="mt-1 text-sm text-gray-500">
              Any members currently assigned to this role will keep their existing permissions until you reassign them. This action can&apos;t be undone.
            </p>
          </div>
        </div>

        {error && <p className="mt-3 text-sm font-medium text-rose-700">{error}</p>}

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={pending}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {pending ? 'Deleting…' : 'Delete role'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AssignMembersDialog({
  role,
  employees,
  currentMemberIds,
  onClose,
}: {
  role: WorkforceRole
  employees: Employee[]
  currentMemberIds: string[]
  onClose: () => void
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set(currentMemberIds))
  const [search, setSearch] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const active = employees.filter((e) => e.status !== 'Resigned')
    if (!q) return active
    return active.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q),
    )
  }, [employees, search])

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function submit() {
    setError(null)
    startTransition(async () => {
      try {
        await setRoleMembers(role.id, Array.from(selected))
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update members.')
      }
    })
  }

  const initialCount = currentMemberIds.length
  const nextCount = selected.size
  const delta = nextCount - initialCount

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Assign members · {role.name}</h2>
            <p className="mt-1 text-sm text-gray-500">
              Tick everyone who should hold this role. Changes save when you click Update.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-gray-100 px-6 py-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name, role, email, department…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-gray-500">
              No-one matches the search.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {filtered.map((e) => {
                const checked = selected.has(e.id)
                return (
                  <li key={e.id}>
                    <button
                      type="button"
                      onClick={() => toggle(e.id)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-gray-50"
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors',
                          checked
                            ? 'border-[#7E5896] bg-[#7E5896] text-white'
                            : 'border-gray-300 bg-white text-transparent',
                        )}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <Avatar name={e.name} color={e.avatarColor} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900">{e.name}</p>
                        <p className="truncate text-xs text-gray-500">{e.jobTitle} · {e.department}</p>
                      </div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                        {e.employeeCode}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {error && (
          <div className="border-t border-gray-100 px-6 pt-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 border-t border-gray-100 px-6 py-4">
          <span className="text-xs font-medium text-gray-500">
            {nextCount} selected
            {delta !== 0 && (
              <>
                {' '}
                <span className={delta > 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  ({delta > 0 ? '+' : ''}
                  {delta})
                </span>
              </>
            )}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending || delta === 0}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#C9A0DC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#b97fd0] disabled:opacity-50"
            >
              <UserMinus className="hidden h-4 w-4" />
              {pending ? 'Saving…' : 'Update members'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
