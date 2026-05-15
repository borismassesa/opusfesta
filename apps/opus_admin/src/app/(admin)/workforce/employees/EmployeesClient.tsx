'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import {
  Briefcase,
  ChevronDown,
  Download,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
  UserPlus,
  X,
} from 'lucide-react'
import {
  createEmployee,
  deleteEmployee,
  grantDashboardAccess,
  revokeDashboardAccess,
  updateEmployee,
} from './actions'
import { cn } from '@/lib/utils'
import { HeaderActionsSlot } from '@/components/HeaderPortals'
import Avatar from '../_components/Avatar'
import StatusPill from '../_components/StatusPill'
import Kpi, { KpiRow } from '../_components/Kpi'
import {
  Department,
  Employee,
  EmployeeStatus,
  EmploymentType,
  Location,
} from '../_lib/data'
import type { WorkforceRole } from '../_lib/types'
import { formatDate, formatTzs, formatTzsCompact, tenureLabel } from '../_lib/format'

const STATUS_TONE: Record<EmployeeStatus, 'green' | 'amber' | 'purple' | 'gray'> = {
  Active: 'green',
  'On Leave': 'amber',
  Onboarding: 'purple',
  Resigned: 'gray',
}

const TYPE_TONE: Record<EmploymentType, 'blue' | 'green' | 'amber' | 'purple'> = {
  Permanent: 'green',
  Contract: 'blue',
  Probation: 'amber',
  Intern: 'purple',
}

const EMPLOYMENT_TYPES: EmploymentType[] = ['Permanent', 'Contract', 'Probation', 'Intern']
const STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Onboarding', 'Resigned']
const LOCATIONS: Location[] = ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Remote']

// Six columns: Employee, Role, Type, Joined, Status, Actions. Salary
// dropped from the list view — sensitive comp info doesn't need to sit
// on a screenshot-friendly directory page; it still lives in the row
// drawer + CSV export. Joined moved next to Type so the temporal facts
// (type + tenure) cluster together, with Status acting as the trailing
// "current state" cell before the action icons.
const ROW_GRID =
  'grid min-w-[920px] grid-cols-[minmax(0,2.4fr)_minmax(0,1.7fr)_110px_minmax(140px,1fr)_120px_72px] items-center gap-5'

export default function EmployeesClient({
  employees,
  departments,
  openJobs,
  roles,
  callerIsOwner,
}: {
  employees: Employee[]
  departments: Department[]
  openJobs: number
  roles: WorkforceRole[]
  callerIsOwner: boolean
}) {
  const [search, setSearch] = useState('')
  const [department, setDepartment] = useState<Department | 'All'>('All')
  const [status, setStatus] = useState<EmployeeStatus | 'All'>('All')
  const [type, setType] = useState<EmploymentType | 'All'>('All')
  const [view, setView] = useState<'list' | 'grid'>('list')
  const [selected, setSelected] = useState<Employee | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleting, setDeleting] = useState<Employee | null>(null)

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase()
    return employees.filter((e) => {
      if (department !== 'All' && e.department !== department) return false
      if (status !== 'All' && e.status !== status) return false
      if (type !== 'All' && e.employmentType !== type) return false
      if (!q) return true
      return (
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.jobTitle.toLowerCase().includes(q) ||
        e.employeeCode.toLowerCase().includes(q)
      )
    })
  }, [employees, search, department, status, type])

  const totalSalary = useMemo(
    () => employees.filter((e) => e.status !== 'Resigned').reduce((sum, e) => sum + e.salaryTzs, 0),
    [employees],
  )

  const totalActive = employees.filter((e) => e.status !== 'Resigned').length
  const totalDepartments = new Set(employees.map((e) => e.department)).size
  const totalLocations = new Set(employees.map((e) => e.location)).size
  const hasActiveFilters = department !== 'All' || status !== 'All' || type !== 'All' || search !== ''

  function clearFilters() {
    setDepartment('All')
    setStatus('All')
    setType('All')
    setSearch('')
  }

  function openEditFromDrawer() {
    if (!selected) return
    setEditing(selected)
    setSelected(null)
  }

  function exportCsv() {
    const rows = [
      ['Employee code', 'Name', 'Email', 'Phone', 'Job title', 'Department', 'Type', 'Status', 'Location', 'Start date', 'Salary (TZS)', 'Leave balance days'],
      ...visible.map((e) => [
        e.employeeCode,
        e.name,
        e.email,
        e.phone,
        e.jobTitle,
        e.department,
        e.employmentType,
        e.status,
        e.location,
        e.startDate,
        e.salaryTzs.toString(),
        e.leaveBalanceDays.toString(),
      ]),
    ]
    const csv = rows
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `opusfesta-employees-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Page-level CTAs portal into the global admin Header so the header's
          right rail owns the high-frequency actions and the in-page toolbar
          can collapse to a single, scan-friendly row of search + filters. */}
      <HeaderActionsSlot>
        <button
          type="button"
          onClick={exportCsv}
          disabled={visible.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" />
          Export
        </button>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" />
          Add employee
        </button>
      </HeaderActionsSlot>

      <KpiRow>
        <Kpi label="Total employees" value={String(totalActive)} delta={`${employees.length} total`} deltaTone="neutral" icon={<Users className="h-4 w-4" />} />
        <Kpi label="Departments" value={String(totalDepartments)} hint={`across ${totalLocations} location${totalLocations === 1 ? '' : 's'}`} icon={<Briefcase className="h-4 w-4" />} />
        <Kpi label="Monthly salary bill" value={formatTzsCompact(totalSalary)} delta="+1.4%" hint="vs last month" icon={<Mail className="h-4 w-4" />} />
        <Kpi label="Open roles" value={String(openJobs)} hint="recruitment pipeline" icon={<UserPlus className="h-4 w-4" />} />
      </KpiRow>

      {/* Single-row toolbar: search + filter pills + result count + view
          toggle. Export and Add employee live in the global Header, so this
          row stays focused on "narrow down what I'm looking at". */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name, role, email, ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]"
            />
          </div>
          <FilterPill
            label="Department"
            value={department}
            onChange={(v) => setDepartment(v as Department | 'All')}
            options={['All', ...departments]}
          />
          <FilterPill
            label="Status"
            value={status}
            onChange={(v) => setStatus(v as EmployeeStatus | 'All')}
            options={['All', ...STATUSES]}
          />
          <FilterPill
            label="Type"
            value={type}
            onChange={(v) => setType(v as EmploymentType | 'All')}
            options={['All', ...EMPLOYMENT_TYPES]}
          />
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-gray-500 hover:text-[#5B2D8E]"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}

          <div className="ml-auto flex items-center gap-3">
            <span className="text-xs text-gray-500 tabular-nums">
              {visible.length === employees.length
                ? `${employees.length} ${employees.length === 1 ? 'person' : 'people'}`
                : `${visible.length} of ${employees.length}`}
            </span>
            <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors',
                  view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
                )}
              >
                List
              </button>
              <button
                type="button"
                onClick={() => setView('grid')}
                className={cn(
                  'rounded-md px-2.5 py-1 transition-colors',
                  view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500',
                )}
              >
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="overflow-x-auto no-scrollbar rounded-2xl border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
          <div
            role="row"
            className={cn(
              ROW_GRID,
              'border-b border-gray-100 bg-gray-50/60 px-5 py-2.5 text-[11px] font-semibold text-gray-500',
            )}
          >
            <span>Employee</span>
            <span>Role</span>
            <span>Type</span>
            <span>Joined</span>
            <span>Status</span>
            <span className="text-right pr-1">Actions</span>
          </div>

          {visible.length === 0 ? (
            <EmptyState />
          ) : (
            visible.map((e) => (
              <EmployeeRow
                key={e.id}
                employee={e}
                onOpen={() => setSelected(e)}
                onEdit={() => setEditing(e)}
                onDelete={() => setDeleting(e)}
              />
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((e) => (
            <EmployeeCard
              key={e.id}
              employee={e}
              onOpen={() => setSelected(e)}
              onEdit={() => setEditing(e)}
              onDelete={() => setDeleting(e)}
            />
          ))}
        </div>
      )}

      {selected && (
        <EmployeeDrawer
          employee={selected}
          onClose={() => setSelected(null)}
          onEdit={openEditFromDrawer}
          onDelete={() => {
            setDeleting(selected)
            setSelected(null)
          }}
        />
      )}
      {showAdd && (
        <EmployeeFormDialog
          mode="create"
          departments={departments}
          roles={roles}
          callerIsOwner={callerIsOwner}
          onClose={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <EmployeeFormDialog
          mode="edit"
          employee={editing}
          departments={departments}
          roles={roles}
          callerIsOwner={callerIsOwner}
          onClose={() => setEditing(null)}
        />
      )}
      {deleting && (
        <DeleteEmployeeDialog
          employee={deleting}
          onClose={() => setDeleting(null)}
        />
      )}
    </div>
  )
}

function EmployeeRow({
  employee,
  onOpen,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      role="row"
      className={cn(
        ROW_GRID,
        'group cursor-pointer border-b border-gray-100 px-5 py-3 transition-colors last:border-b-0 hover:bg-gray-50/80',
      )}
      onClick={onOpen}
    >
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={employee.name} color={employee.avatarColor} src={employee.avatarUrl} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-950">{employee.name}</p>
          <p className="truncate text-xs text-gray-500">{employee.email}</p>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{employee.jobTitle}</p>
        <p className="truncate text-xs text-gray-500">{employee.department}</p>
      </div>
      <div>
        <StatusPill tone={TYPE_TONE[employee.employmentType]} label={employee.employmentType} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-700 tabular-nums">{formatDate(employee.startDate)}</p>
        <p className="truncate text-[11px] text-gray-400">{tenureLabel(employee.startDate)}</p>
      </div>
      <div className="flex flex-col items-start gap-1">
        <StatusPill tone={STATUS_TONE[employee.status]} label={employee.status} />
        {employee.dashboardAccess ? (
          <StatusPill tone="purple" label="Dashboard" />
        ) : employee.invitedAt ? (
          <StatusPill tone="amber" label="Invited" />
        ) : null}
      </div>
      <div
        className="flex items-center justify-end gap-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${employee.name}`}
          title="Edit"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-[#F0DFF6] hover:text-[#5B2D8E]"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${employee.name}`}
          title="Delete"
          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function EmployeeCard({
  employee,
  onOpen,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onOpen: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen()
        }
      }}
      className="group relative cursor-pointer rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-shadow hover:shadow-md"
    >
      <div className="flex items-center gap-3 pr-16">
        <Avatar name={employee.name} color={employee.avatarColor} src={employee.avatarUrl} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-gray-950">{employee.name}</p>
          <p className="truncate text-xs text-gray-500">{employee.jobTitle}</p>
        </div>
      </div>
      <StatusPill
        tone={STATUS_TONE[employee.status]}
        label={employee.status}
        className="absolute right-5 top-5"
      />
      <div className="mt-4 flex flex-wrap gap-1.5">
        <StatusPill tone={TYPE_TONE[employee.employmentType]} label={employee.employmentType} />
        <StatusPill tone="gray" label={employee.department} />
      </div>
      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {employee.location}
        </span>
        <span className="font-bold uppercase tracking-wider text-[#7E5896]">
          {tenureLabel(employee.startDate)}
        </span>
      </div>

      <div
        className="absolute right-3 top-3 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${employee.name}`}
          title="Edit"
          className="rounded-md bg-white/90 p-1.5 text-gray-400 shadow-sm hover:bg-[#F0DFF6] hover:text-[#5B2D8E]"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onClick={onDelete}
          aria-label={`Delete ${employee.name}`}
          title="Delete"
          className="rounded-md bg-white/90 p-1.5 text-gray-400 shadow-sm hover:bg-rose-50 hover:text-rose-700"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

function FilterPill({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
}) {
  const active = value !== 'All'
  return (
    <label
      className={cn(
        'relative inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
        active
          ? 'border-[#E0BEEC] bg-[#F0DFF6] text-[#5B2D8E]'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
      )}
    >
      <span className="text-gray-400">{label}:</span>
      <span className={active ? 'text-[#5B2D8E]' : 'text-gray-900'}>{value}</span>
      <ChevronDown className="h-3 w-3 text-gray-400" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-700">
        <Users className="h-5 w-5" />
      </span>
      <p className="text-sm font-semibold text-gray-900">No employees match these filters</p>
      <p className="mt-1 text-sm text-gray-500">Try clearing a filter or adjusting the search.</p>
    </div>
  )
}

function EmployeeDrawer({
  employee,
  onClose,
  onEdit,
  onDelete,
}: {
  employee: Employee
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex justify-end bg-gray-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <Avatar name={employee.name} color={employee.avatarColor} src={employee.avatarUrl} size="lg" />
            <div>
              <p className="text-base font-semibold text-gray-900">{employee.name}</p>
              <p className="text-sm text-gray-500">{employee.jobTitle}</p>
            </div>
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

        <div className="space-y-6 px-6 py-6">
          <div className="flex flex-wrap gap-2">
            <StatusPill tone={STATUS_TONE[employee.status]} label={employee.status} />
            <StatusPill tone={TYPE_TONE[employee.employmentType]} label={employee.employmentType} />
            <StatusPill tone="gray" label={employee.department} />
          </div>

          <Section title="Contact">
            <Detail icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={employee.email} />
            <Detail icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={employee.phone || '—'} />
            <Detail icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={employee.location} />
          </Section>

          <Section title="Employment">
            <Detail label="Employee ID" value={employee.employeeCode} />
            <Detail label="Start date" value={formatDate(employee.startDate)} />
            <Detail label="Tenure" value={tenureLabel(employee.startDate)} />
            <Detail label="Manager" value={employee.manager ?? 'Reports to founders'} />
          </Section>

          <Section title="Compensation">
            <Detail label="Monthly salary" value={formatTzs(employee.salaryTzs)} />
            <Detail label="Annual gross" value={formatTzs(employee.salaryTzs * 12)} />
            <Detail label="Leave balance" value={`${employee.leaveBalanceDays} days`} />
          </Section>

          <Section title="Dashboard access">
            <Detail
              label="Status"
              value={
                employee.dashboardAccess
                  ? 'Active — can sign in'
                  : employee.invitedAt
                    ? 'Invitation pending'
                    : 'No access'
              }
            />
            {employee.invitedAt && (
              <Detail label="Invited" value={formatDate(employee.invitedAt)} />
            )}
            {employee.lastDashboardLogin && (
              <Detail label="Last sign-in" value={formatDate(employee.lastDashboardLogin)} />
            )}
          </Section>

          <div className="flex flex-col gap-2 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Edit details
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="flex-1 rounded-lg border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Detail({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 text-gray-500">
        {icon}
        {label}
      </span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Shared form dialog — handles both create and edit. Switching off `mode`
// keeps the markup single-source while letting us keep the create/edit
// server actions strict and separate.
// ---------------------------------------------------------------------------

type FormDialogProps =
  | {
      mode: 'create'
      departments: Department[]
      roles: WorkforceRole[]
      callerIsOwner: boolean
      onClose: () => void
      employee?: never
    }
  | {
      mode: 'edit'
      departments: Department[]
      roles: WorkforceRole[]
      callerIsOwner: boolean
      onClose: () => void
      employee: Employee
    }

function EmployeeFormDialog(props: FormDialogProps) {
  const isEdit = props.mode === 'edit'
  const seed = isEdit ? props.employee : null
  const { departments, roles, callerIsOwner, onClose } = props

  const [fullName, setFullName] = useState(seed?.name ?? '')
  const [email, setEmail] = useState(seed?.email ?? '')
  const [phone, setPhone] = useState(seed?.phone ?? '')
  const [jobTitle, setJobTitle] = useState(seed?.jobTitle ?? '')
  const [department, setDepartment] = useState<Department>(seed?.department ?? departments[0] ?? 'Founders')
  const [employmentType, setEmploymentType] = useState<EmploymentType>(seed?.employmentType ?? 'Permanent')
  const [status, setStatus] = useState<EmployeeStatus>(seed?.status ?? 'Onboarding')
  const [location, setLocation] = useState<Location>(seed?.location ?? 'Dar es Salaam')
  const [startDate, setStartDate] = useState(seed?.startDate ?? new Date().toISOString().slice(0, 10))
  const [salaryTzs, setSalaryTzs] = useState(seed ? String(seed.salaryTzs) : '')
  const [leaveBalance, setLeaveBalance] = useState(seed ? String(seed.leaveBalanceDays) : '21')
  // Dashboard access state. On create: ticking the toggle queues an
  // invitation to be sent right after the employee row is created.
  // On edit: the toggle reflects the current grant; flipping it triggers
  // grantDashboardAccess (sends a fresh invite) or revokeDashboardAccess.
  const initialGrant = seed?.dashboardAccess ?? false
  const initialRoleId = seed?.dashboardRoleId ?? roles[0]?.id ?? ''
  const [grantAccess, setGrantAccess] = useState(initialGrant)
  const [accessRoleId, setAccessRoleId] = useState(initialRoleId)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [accessNotice, setAccessNotice] = useState<string | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function submit() {
    setError(null)
    setAccessNotice(null)
    const salary = Number.parseInt(salaryTzs.replace(/[^0-9]/g, ''), 10) || 0
    const leave = Number.parseInt(leaveBalance.replace(/[^0-9]/g, ''), 10) || 0
    startTransition(async () => {
      try {
        let employeeId: string
        if (isEdit) {
          await updateEmployee(props.employee.id, {
            fullName,
            email,
            phone: phone || null,
            jobTitle,
            department,
            employmentType,
            status,
            location,
            startDate,
            salaryTzs: salary,
            leaveBalanceDays: leave,
          })
          employeeId = props.employee.id
        } else {
          const created = await createEmployee({
            fullName,
            email,
            phone: phone || undefined,
            jobTitle,
            department,
            employmentType,
            status,
            location,
            startDate,
            salaryTzs: salary,
            leaveBalanceDays: leave,
          })
          employeeId = created.id
        }

        // Reconcile dashboard access. Three branches to handle:
        //   (1) toggled OFF and was previously ON  → revoke
        //   (2) toggled ON and (was OFF, or role changed) → re-grant (sends fresh invite)
        //   (3) unchanged → no-op
        // grantDashboardAccess always (re-)issues an invitation, so we
        // only call it when something actually changed to avoid spamming
        // the invitee with duplicate emails.
        if (callerIsOwner) {
          const wasGranted = initialGrant
          const roleChanged = accessRoleId !== initialRoleId
          if (!grantAccess && wasGranted) {
            await revokeDashboardAccess(employeeId)
          } else if (grantAccess && (!wasGranted || roleChanged)) {
            if (!accessRoleId) {
              throw new Error('Pick a role before granting dashboard access.')
            }
            const result = await grantDashboardAccess(employeeId, accessRoleId)
            if (!result.emailSent) {
              // The "existing Clerk user" path is a feature, not a failure
              // — the person already has a password, so we just granted
              // access directly. Tell the admin so they don't expect an
              // email that won't arrive.
              if (result.emailReason === 'no_email_needed_existing_user') {
                setAccessNotice(
                  `Dashboard access granted. ${email} already has a Clerk account, so no invitation email was sent — they can sign in immediately with their existing password.`
                )
                return
              }
              setAccessNotice(
                `Invitation saved, but the email did not send (${result.emailReason ?? 'unknown'}). Send the invite link manually from the pending invitations panel.`
              )
              return
            }
          }
        }

        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not save changes.')
      }
    })
  }

  const title = isEdit ? `Edit ${seed!.name}` : 'Add employee'
  const subtitle = isEdit
    ? `Employee code ${seed!.employeeCode} · joined ${formatDate(seed!.startDate)}`
    : 'A new employee code (OF-XXX) is generated automatically.'

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
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
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
          <FieldGroup title="Personal">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoFocus
                  className={inputClass}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 ..."
                  className={inputClass}
                />
              </Field>
              <Field label="Location">
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value as Location)}
                  className={inputClass}
                >
                  {LOCATIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup title="Role">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Job title">
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Department">
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as Department)}
                  className={inputClass}
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Employment type">
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className={inputClass}
                >
                  {EMPLOYMENT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Status">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
                  className={inputClass}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </FieldGroup>

          <FieldGroup title="Compensation">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Start date">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Monthly salary (TZS)">
                <input
                  type="text"
                  inputMode="numeric"
                  value={salaryTzs}
                  onChange={(e) => setSalaryTzs(e.target.value)}
                  placeholder="e.g. 4500000"
                  className={inputClass}
                />
              </Field>
              <Field label="Annual leave balance">
                <input
                  type="text"
                  inputMode="numeric"
                  value={leaveBalance}
                  onChange={(e) => setLeaveBalance(e.target.value)}
                  placeholder="days"
                  className={inputClass}
                />
              </Field>
            </div>
          </FieldGroup>

          {callerIsOwner && (
            <FieldGroup title="Dashboard access">
              <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={grantAccess}
                    onChange={(e) => setGrantAccess(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#7E5896] focus:ring-[#C9A0DC]"
                  />
                  <span className="text-sm">
                    <span className="block font-semibold text-gray-900">
                      Grant access to the admin dashboard
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {seed?.dashboardAccess
                        ? 'They can sign in today. Untick to revoke access immediately.'
                        : seed?.invitedAt
                          ? 'An invitation was sent on ' +
                            formatDate(seed.invitedAt) +
                            ' but has not been accepted. Tick to resend.'
                          : 'A Clerk invitation will be emailed to the address above. They pick their own password — OpusFesta never stores it.'}
                    </span>
                  </span>
                </label>

                {grantAccess && (
                  <Field label="Role">
                    <select
                      value={accessRoleId}
                      onChange={(e) => setAccessRoleId(e.target.value)}
                      className={inputClass}
                    >
                      {roles.length === 0 && (
                        <option value="">No roles defined yet — create one in Roles & Permissions</option>
                      )}
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} {r.isSystem ? '· system' : ''}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {seed?.lastDashboardLogin && (
                  <p className="text-[11px] text-gray-500">
                    Last sign-in: {formatDate(seed.lastDashboardLogin)}
                  </p>
                )}
              </div>
              {accessNotice && (
                <p className="mt-2 text-xs font-medium text-amber-700">{accessNotice}</p>
              )}
            </FieldGroup>
          )}
        </div>

        {error && (
          <div className="border-t border-gray-100 px-6 pt-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
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
            disabled={pending || !fullName || !email || !jobTitle || !salaryTzs}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add employee'}
          </button>
        </div>
      </div>
    </div>
  )
}

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-transparent focus:ring-2 focus:ring-[#C9A0DC]'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-500">
        {label}
      </span>
      {children}
    </label>
  )
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-gray-400">{title}</h3>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Delete confirmation
// ---------------------------------------------------------------------------

function DeleteEmployeeDialog({
  employee,
  onClose,
}: {
  employee: Employee
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
        await deleteEmployee(employee.id)
        onClose()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not delete this employee.')
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
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">Delete {employee.name}?</h2>
            <p className="mt-1 text-sm text-gray-500">
              This removes <span className="font-semibold">{employee.employeeCode}</span> from
              workforce records, along with their shifts, attendance and leave history. This
              action can&apos;t be undone.
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
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-700 disabled:opacity-50"
          >
            {pending ? 'Deleting…' : 'Delete employee'}
          </button>
        </div>
      </div>
    </div>
  )
}
