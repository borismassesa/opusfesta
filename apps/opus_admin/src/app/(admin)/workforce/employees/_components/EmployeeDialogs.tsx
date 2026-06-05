'use client'

import { useEffect, useState, useTransition } from 'react'
import { Check, Copy, KeyRound, Mail, Trash2, X } from 'lucide-react'
import {
  createEmployee,
  deleteEmployee,
  grantDashboardAccess,
  revokeDashboardAccess,
  updateEmployee,
} from '../actions'
import { formatDate } from '../../_lib/format'
import type {
  Department,
  Employee,
  EmployeeStatus,
  EmploymentType,
  Location,
  WorkforceRole,
} from '../../_lib/data'

const EMPLOYMENT_TYPES: EmploymentType[] = ['Permanent', 'Contract', 'Probation', 'Intern']
const STATUSES: EmployeeStatus[] = ['Active', 'On Leave', 'Onboarding', 'Resigned']
const LOCATIONS: Location[] = ['Dar es Salaam', 'Arusha', 'Zanzibar', 'Remote']

// Shared form dialog — handles both create and edit. Switching off `mode`
// keeps the markup single-source while letting the create/edit server
// actions stay strict and separate.

// Roster shape required for the manager picker. Kept narrow so callers
// don't have to pass the full Employee list when a Pick<> suffices.
export type ManagerCandidate = {
  id: string
  name: string
  jobTitle: string
}

type FormDialogProps =
  | {
      mode: 'create'
      departments: Department[]
      roles: WorkforceRole[]
      managerCandidates: ManagerCandidate[]
      callerIsOwner: boolean
      onClose: () => void
      employee?: never
    }
  | {
      mode: 'edit'
      departments: Department[]
      roles: WorkforceRole[]
      managerCandidates: ManagerCandidate[]
      callerIsOwner: boolean
      onClose: () => void
      employee: Employee
    }

export function EmployeeFormDialog(props: FormDialogProps) {
  const isEdit = props.mode === 'edit'
  const seed = isEdit ? props.employee : null
  const { departments, roles, managerCandidates, callerIsOwner, onClose } = props

  // Exclude the row itself from the manager dropdown — self-reference
  // would create a cycle (caught server-side too, but no point showing it).
  const eligibleManagers = isEdit
    ? managerCandidates.filter((m) => m.id !== seed!.id)
    : managerCandidates

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
  // "" sentinel maps to null manager_id — Postgres won't accept the
  // empty string into a UUID column, so we always coerce before sending.
  const [managerId, setManagerId] = useState<string>(seed?.managerId ?? '')
  const [notes, setNotes] = useState(seed?.notes ?? '')
  const initialGrant = seed?.dashboardAccess ?? false
  const initialRoleId = seed?.dashboardRoleId ?? roles[0]?.id ?? ''
  const [grantAccess, setGrantAccess] = useState(initialGrant)
  const [accessRoleId, setAccessRoleId] = useState(initialRoleId)
  // How to bring a brand-new teammate online: create their login now with a
  // temporary password (default — no email needed), or email an invitation.
  const [accessMethod, setAccessMethod] = useState<'create_login' | 'invite'>('create_login')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [accessNotice, setAccessNotice] = useState<string | null>(null)
  // When set, the login was just created — show the temp credentials once for
  // the admin to hand over (kept only in memory, never persisted).
  const [createdCreds, setCreatedCreds] = useState<{ email: string; password: string } | null>(null)
  const [copied, setCopied] = useState(false)

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
          const result = await updateEmployee(props.employee.id, {
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
            managerId: managerId || null,
            notes: notes.trim() || null,
          })
          if (!result.ok) {
            setError(result.error)
            return
          }
          employeeId = props.employee.id
        } else {
          const result = await createEmployee({
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
            managerId: managerId || null,
            notes: notes.trim() || null,
          })
          if (!result.ok) {
            setError(result.error)
            return
          }
          employeeId = result.id
        }

        if (callerIsOwner) {
          const wasGranted = initialGrant
          const roleChanged = accessRoleId !== initialRoleId
          if (!grantAccess && wasGranted) {
            await revokeDashboardAccess(employeeId)
          } else if (grantAccess && (!wasGranted || roleChanged)) {
            if (!accessRoleId) {
              throw new Error('Pick a role before granting dashboard access.')
            }
            const result = await grantDashboardAccess(employeeId, accessRoleId, accessMethod)
            if (result.mode === 'created_login' && result.tempPassword) {
              // Login created — surface the one-time credentials and keep the
              // dialog open so the admin can copy them.
              setCreatedCreds({ email, password: result.tempPassword })
              return
            }
            if (result.mode === 'granted_existing') {
              setAccessNotice(
                `Dashboard access granted. ${email} already has a Clerk account, so no email was sent — they can sign in immediately with their existing password.`
              )
              return
            }
            if (!result.emailSent) {
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

  async function copyCreds() {
    if (!createdCreds) return
    try {
      await navigator.clipboard.writeText(
        `Email: ${createdCreds.email}\nTemporary password: ${createdCreds.password}`,
      )
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard can be blocked (insecure context / permissions) — the
      // password is still visible on screen for manual copy.
    }
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
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
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
              <Field label="Reports to">
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">— No manager (reports to founders)</option>
                  {eligibleManagers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} · {m.jobTitle}
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

          <FieldGroup title="Internal notes">
            <Field label="Notes (visible to admins and HR only)">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Probation review notes, performance comments, key context for HR…"
                className={`${inputClass} min-h-[96px] resize-y`}
              />
            </Field>
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
                          : 'Create their login now, or email an invitation. Either way OpusFesta never stores their final password.'}
                    </span>
                  </span>
                </label>

                {grantAccess && (
                  <>
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

                    {!seed?.dashboardAccess && (
                      <fieldset className="space-y-2">
                        <legend className="mb-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                          How they get in
                        </legend>
                        <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                          <input
                            type="radio"
                            name="access-method"
                            checked={accessMethod === 'create_login'}
                            onChange={() => setAccessMethod('create_login')}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-[#7E5896] focus:ring-[#C9A0DC]"
                          />
                          <span className="text-sm">
                            <span className="block font-medium text-gray-900">
                              Create login now
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500">
                              Generates a temporary password to hand over. They set
                              their own on first sign-in. No email needed.
                            </span>
                          </span>
                        </label>
                        <label className="flex items-start gap-2.5 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2.5">
                          <input
                            type="radio"
                            name="access-method"
                            checked={accessMethod === 'invite'}
                            onChange={() => setAccessMethod('invite')}
                            className="mt-0.5 h-4 w-4 border-gray-300 text-[#7E5896] focus:ring-[#C9A0DC]"
                          />
                          <span className="text-sm">
                            <span className="block font-medium text-gray-900">
                              Email an invitation
                            </span>
                            <span className="mt-0.5 block text-xs text-gray-500">
                              Sends a sign-up link; they pick their own password.
                              Requires email delivery to be working.
                            </span>
                          </span>
                        </label>
                      </fieldset>
                    )}
                  </>
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

        {/* One-time credentials — shown over the dialog after a login is
            created so the admin can hand them over. Not persisted anywhere. */}
        {createdCreds && (
          <div className="absolute inset-0 z-10 flex flex-col rounded-2xl bg-white">
            <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Login created</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Share these with the new teammate. They’ll set their own
                  password on first sign-in — this won’t be shown again.
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

            <div className="space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/60 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="font-medium text-gray-900">{createdCreds.email}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <KeyRound className="h-4 w-4 shrink-0 text-gray-400" />
                    <code className="truncate rounded border border-gray-200 bg-white px-2 py-1 font-mono text-sm text-gray-900">
                      {createdCreds.password}
                    </code>
                  </div>
                  <button
                    type="button"
                    onClick={copyCreds}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
                Hand this over securely. The temporary password forces a reset
                at first sign-in and is never stored by OpusFesta.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Done
              </button>
            </div>
          </div>
        )}
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

export function DeleteEmployeeDialog({
  employee,
  onClose,
  onDeleted,
}: {
  employee: Employee
  onClose: () => void
  onDeleted?: () => void
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
        onDeleted?.()
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
