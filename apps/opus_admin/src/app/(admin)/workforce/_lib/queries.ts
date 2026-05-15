// Server-only data access for the Workforce module. All reads use the
// service-role admin client and apply admin-only filtering. Pages call
// these from server components; actions in each route call them when
// they need to refresh data after a mutation.

import 'server-only'
import { clerkClient } from '@clerk/nextjs/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createSupabaseAdminClient } from '@/lib/supabase'
import type {
  Candidate,
  Department,
  Employee,
  EmployeeStatus,
  EmploymentType,
  Job,
  JobStatus,
  LeaveRequest,
  LeaveStatus,
  LeaveType,
  Location,
  PayrollRun,
  PayrollStatus,
  ShiftType,
  WorkforceShift,
  WorkforceAttendance,
  WorkforceRole,
} from './types'

type EmployeeRow = {
  id: string
  employee_code: string
  full_name: string
  email: string
  phone: string | null
  job_title: string
  department: Department
  manager_id: string | null
  employment_type: EmploymentType
  status: EmployeeStatus
  location: Location
  start_date: string
  salary_tzs: number
  leave_balance_days: number
  avatar_color: string
  avatar_url: string | null
  notes: string | null
  dashboard_access: boolean | null
  dashboard_role_id: string | null
  invited_at: string | null
  last_dashboard_login: string | null
  clerk_user_id: string | null
}

const EMPLOYEE_COLUMNS =
  'id, employee_code, full_name, email, phone, job_title, department, manager_id, employment_type, status, location, start_date, salary_tzs, leave_balance_days, avatar_color, avatar_url, notes, dashboard_access, dashboard_role_id, invited_at, last_dashboard_login, clerk_user_id'

function mapEmployee(row: EmployeeRow, managerName: string | null): Employee {
  return {
    id: row.id,
    employeeCode: row.employee_code,
    name: row.full_name,
    email: row.email,
    phone: row.phone ?? '',
    jobTitle: row.job_title,
    department: row.department,
    manager: managerName,
    employmentType: row.employment_type,
    status: row.status,
    location: row.location,
    startDate: row.start_date,
    salaryTzs: Number(row.salary_tzs),
    leaveBalanceDays: row.leave_balance_days,
    avatarColor: row.avatar_color,
    avatarUrl: row.avatar_url ?? null,
    dashboardAccess: Boolean(row.dashboard_access),
    dashboardRoleId: row.dashboard_role_id,
    invitedAt: row.invited_at,
    lastDashboardLogin: row.last_dashboard_login,
    clerkUserId: row.clerk_user_id,
  }
}

export async function getEmployees(): Promise<Employee[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employees')
    .select(EMPLOYEE_COLUMNS)
    .order('employee_code', { ascending: true })
    .returns<EmployeeRow[]>()
  if (error) throw new Error(`[workforce] getEmployees: ${error.message}`)

  const rows = data ?? []

  // Resync Clerk profile pictures so users see their latest avatar even
  // after they update it in Clerk. The cached avatar_url is set at
  // invite-accept / grant time; without this resync the row would only
  // refresh on the next re-grant. Cached for 5 minutes (CLERK_AVATAR_TTL_MS)
  // so a heavily-loaded page doesn't hammer Clerk's API on every request.
  const freshAvatars = await refreshClerkAvatarsIfStale(supabase, rows)

  const nameById = new Map(rows.map((r) => [r.id, r.full_name]))
  return rows.map((row) => {
    const overriddenAvatar = freshAvatars.get(row.id)
    const enriched: EmployeeRow = overriddenAvatar !== undefined
      ? { ...row, avatar_url: overriddenAvatar }
      : row
    return mapEmployee(
      enriched,
      row.manager_id ? nameById.get(row.manager_id) ?? null : null,
    )
  })
}

// ---------------------------------------------------------------------------
// Clerk avatar resync
// ---------------------------------------------------------------------------
// Workforce employees who completed Clerk sign-up have their imageUrl
// cached on workforce_employees.avatar_url. Clerk doesn't notify us when
// the user uploads a new picture, so without this helper the cached
// avatar would go stale until the next invite-accept / re-grant.
//
// Strategy:
//   1. Cache the in-memory snapshot for 5 minutes (one fetch covers all
//      rows that share the request).
//   2. After the request, batch-fetch all linked Clerk users in one
//      `getUserList({ userId: [...] })` call.
//   3. For any row whose Supabase avatar_url disagrees with Clerk's
//      current imageUrl, schedule a background UPDATE — don't block the
//      response on it.
//   4. Return the freshest URLs to the caller so the very same render
//      shows the new picture (no second refresh needed).

const CLERK_AVATAR_TTL_MS = 5 * 60 * 1000

type AvatarCacheEntry = {
  fetchedAt: number
  byClerkId: Map<string, string | null>
}

const avatarCache: { current: AvatarCacheEntry | null } = { current: null }

async function refreshClerkAvatarsIfStale(
  supabase: SupabaseClient,
  rows: EmployeeRow[],
): Promise<Map<string, string | null>> {
  const linked = rows.filter(
    (r): r is EmployeeRow & { clerk_user_id: string } => Boolean(r.clerk_user_id),
  )
  if (linked.length === 0) return new Map()

  // Cache hit — reuse the previous snapshot, but still surface the
  // freshest URLs to the caller in case Supabase's avatar_url is older
  // than the cached Clerk one.
  const cache = avatarCache.current
  const cacheValid = cache && Date.now() - cache.fetchedAt < CLERK_AVATAR_TTL_MS
  let byClerkId: Map<string, string | null>
  if (cacheValid) {
    byClerkId = cache.byClerkId
  } else {
    try {
      const clerk = await clerkClient()
      const { data: users } = await clerk.users.getUserList({
        userId: linked.map((r) => r.clerk_user_id),
        limit: linked.length,
      })
      byClerkId = new Map(users.map((u) => [u.id, u.imageUrl ?? null]))
      avatarCache.current = { fetchedAt: Date.now(), byClerkId }
    } catch (err) {
      console.warn('[workforce] Clerk avatar resync failed', err)
      // Soft fail — keep returning whatever we already had cached.
      return new Map()
    }
  }

  // Build the per-employee fresh-URL map AND the list of Supabase rows
  // whose cached value drifted (need a background UPDATE).
  const result = new Map<string, string | null>()
  const drifted: { id: string; avatar_url: string }[] = []
  for (const row of linked) {
    const fresh = byClerkId.get(row.clerk_user_id)
    if (fresh === undefined) continue
    result.set(row.id, fresh)
    if (fresh && fresh !== row.avatar_url) {
      drifted.push({ id: row.id, avatar_url: fresh })
    }
  }

  if (drifted.length > 0) {
    // Fire-and-forget — don't block the page render on the writeback.
    void persistAvatarUpdates(supabase, drifted).catch((err) => {
      console.warn('[workforce] avatar writeback failed', err)
    })
  }

  return result
}

async function persistAvatarUpdates(
  supabase: SupabaseClient,
  updates: { id: string; avatar_url: string }[],
): Promise<void> {
  // Per-row UPDATEs — there's no native Supabase batch-by-id helper and
  // the workforce roster is small (~10s), so individual updates stay
  // well under any rate limit.
  await Promise.all(
    updates.map(({ id, avatar_url }) =>
      supabase.from('workforce_employees').update({ avatar_url }).eq('id', id),
    ),
  )
}

export async function getEmployeeById(id: string): Promise<Employee | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employees')
    .select(EMPLOYEE_COLUMNS)
    .eq('id', id)
    .maybeSingle<EmployeeRow>()
  if (error) throw new Error(`[workforce] getEmployeeById: ${error.message}`)
  if (!data) return null
  let managerName: string | null = null
  if (data.manager_id) {
    const { data: m } = await supabase
      .from('workforce_employees')
      .select('full_name')
      .eq('id', data.manager_id)
      .maybeSingle<{ full_name: string }>()
    managerName = m?.full_name ?? null
  }
  return mapEmployee(data, managerName)
}

// --- Schedule ---

type ShiftRow = {
  id: string
  employee_id: string
  weekday: number
  shift_type: ShiftType
  start_time: string | null
  end_time: string | null
  note: string | null
}

export async function getShifts(): Promise<WorkforceShift[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_shifts')
    .select('id, employee_id, weekday, shift_type, start_time, end_time, note')
    .returns<ShiftRow[]>()
  if (error) throw new Error(`[workforce] getShifts: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    weekday: r.weekday,
    type: r.shift_type,
    start: r.start_time ? r.start_time.slice(0, 5) : undefined,
    end: r.end_time ? r.end_time.slice(0, 5) : undefined,
    note: r.note ?? undefined,
  }))
}

// --- Payroll ---

type PayrollRow = {
  id: string
  period: string
  pay_date: string
  status: PayrollStatus
  headcount: number
  gross_tzs: number
  paye_tzs: number
  nssf_tzs: number
  net_tzs: number
}

export async function getPayrollRuns(): Promise<PayrollRun[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_payroll_runs')
    .select('id, period, pay_date, status, headcount, gross_tzs, paye_tzs, nssf_tzs, net_tzs')
    .order('pay_date', { ascending: false })
    .returns<PayrollRow[]>()
  if (error) throw new Error(`[workforce] getPayrollRuns: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id,
    period: r.period,
    payDate: r.pay_date,
    status: r.status,
    headcount: r.headcount,
    grossTzs: Number(r.gross_tzs),
    payeTzs: Number(r.paye_tzs),
    nssfTzs: Number(r.nssf_tzs),
    netTzs: Number(r.net_tzs),
  }))
}

// --- Leave ---

type LeaveRow = {
  id: string
  employee_id: string
  leave_type: LeaveType
  start_date: string
  end_date: string
  days: number
  status: LeaveStatus
  reason: string
  submitted_at: string
}

export async function getLeaveRequests(): Promise<LeaveRequest[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_leave_requests')
    .select('id, employee_id, leave_type, start_date, end_date, days, status, reason, submitted_at')
    .order('submitted_at', { ascending: false })
    .returns<LeaveRow[]>()
  if (error) throw new Error(`[workforce] getLeaveRequests: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    type: r.leave_type,
    startDate: r.start_date,
    endDate: r.end_date,
    days: r.days,
    status: r.status,
    reason: r.reason,
    submittedAt: r.submitted_at,
  }))
}

// --- Attendance ---

type AttendanceRow = {
  id: string
  employee_id: string
  work_date: string
  clock_in: string | null
  clock_out: string | null
  status: WorkforceAttendance['status']
  worked_hours: number
}

export async function getAttendance(date: string): Promise<WorkforceAttendance[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_attendance')
    .select('id, employee_id, work_date, clock_in, clock_out, status, worked_hours')
    .eq('work_date', date)
    .returns<AttendanceRow[]>()
  if (error) throw new Error(`[workforce] getAttendance: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id,
    employeeId: r.employee_id,
    date: r.work_date,
    clockIn: r.clock_in ? r.clock_in.slice(0, 5) : null,
    clockOut: r.clock_out ? r.clock_out.slice(0, 5) : null,
    status: r.status,
    workedHours: Number(r.worked_hours),
  }))
}

// --- Roles ---

type RoleRow = {
  id: string
  slug: string
  name: string
  description: string
  permission_keys: string[]
  members_count: number
  is_system: boolean
}

export async function getRoles(): Promise<WorkforceRole[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_roles')
    .select('id, slug, name, description, permission_keys, members_count, is_system')
    .order('is_system', { ascending: false })
    .order('name', { ascending: true })
    .returns<RoleRow[]>()
  if (error) throw new Error(`[workforce] getRoles: ${error.message}`)
  return (data ?? []).map((r) => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    description: r.description,
    members: r.members_count,
    permissionKeys: r.permission_keys,
    isSystem: r.is_system,
  }))
}

export async function getRoleMembers(roleId: string): Promise<string[]> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_role_members')
    .select('employee_id')
    .eq('role_id', roleId)
    .returns<Array<{ employee_id: string }>>()
  if (error) throw new Error(`[workforce] getRoleMembers: ${error.message}`)
  return (data ?? []).map((r) => r.employee_id)
}

export async function getAllRoleMembers(): Promise<Map<string, string[]>> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_role_members')
    .select('role_id, employee_id')
    .returns<Array<{ role_id: string; employee_id: string }>>()
  if (error) throw new Error(`[workforce] getAllRoleMembers: ${error.message}`)
  const map = new Map<string, string[]>()
  for (const row of data ?? []) {
    const list = map.get(row.role_id) ?? []
    list.push(row.employee_id)
    map.set(row.role_id, list)
  }
  return map
}

// --- Jobs + Candidates ---

type JobRow = {
  id: string
  slug: string
  title: string
  department: Department
  location: Location
  employment_type: EmploymentType
  status: JobStatus
  opened_at: string
  posted_salary_min_tzs: number
  posted_salary_max_tzs: number
  hiring_manager: string
}

type CandidateRow = {
  id: string
  job_id: string
  full_name: string
  email: string
  stage: Candidate['stage']
  source: Candidate['source']
  rating: number
  applied_at: string
}

export async function getJobsWithCandidates(): Promise<Job[]> {
  const supabase = createSupabaseAdminClient()
  const [jobsRes, candidatesRes] = await Promise.all([
    supabase
      .from('workforce_jobs')
      .select(
        'id, slug, title, department, location, employment_type, status, opened_at, posted_salary_min_tzs, posted_salary_max_tzs, hiring_manager'
      )
      .order('opened_at', { ascending: false })
      .returns<JobRow[]>(),
    supabase
      .from('workforce_candidates')
      .select('id, job_id, full_name, email, stage, source, rating, applied_at')
      .order('applied_at', { ascending: false })
      .returns<CandidateRow[]>(),
  ])

  if (jobsRes.error) throw new Error(`[workforce] getJobs: ${jobsRes.error.message}`)
  if (candidatesRes.error) throw new Error(`[workforce] getCandidates: ${candidatesRes.error.message}`)

  const byJob = new Map<string, Candidate[]>()
  for (const c of candidatesRes.data ?? []) {
    const list = byJob.get(c.job_id) ?? []
    list.push({
      id: c.id,
      name: c.full_name,
      email: c.email,
      stage: c.stage,
      source: c.source,
      rating: Math.max(1, Math.min(5, c.rating)) as Candidate['rating'],
      appliedAt: c.applied_at,
    })
    byJob.set(c.job_id, list)
  }

  return (jobsRes.data ?? []).map((j) => ({
    id: j.id,
    slug: j.slug,
    title: j.title,
    department: j.department,
    location: j.location,
    type: j.employment_type,
    status: j.status,
    openedAt: j.opened_at,
    postedSalaryTzs: [Number(j.posted_salary_min_tzs), Number(j.posted_salary_max_tzs)],
    hiringManager: j.hiring_manager,
    candidates: byJob.get(j.id) ?? [],
  }))
}

// DEPARTMENTS lives in `types.ts` so client components can import it
// without dragging `server-only` into the browser bundle. Re-export here
// for back-compat with existing call sites.
export { DEPARTMENTS } from './types'

// --- Invitations ---

export type WorkforceInvitationListRow = {
  id: string
  employeeId: string
  employeeName: string
  employeeCode: string
  email: string
  roleId: string
  roleName: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invitedAt: string
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
}

type InvitationJoinRow = {
  id: string
  employee_id: string
  email: string
  role_id: string
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  invited_at: string
  expires_at: string
  accepted_at: string | null
  revoked_at: string | null
  workforce_employees: { full_name: string; employee_code: string } | null
  workforce_roles: { name: string } | null
}

export async function getWorkforceInvitations(
  status?: WorkforceInvitationListRow['status']
): Promise<WorkforceInvitationListRow[]> {
  const supabase = createSupabaseAdminClient()
  let query = supabase
    .from('workforce_invitations')
    .select(
      'id, employee_id, email, role_id, status, invited_at, expires_at, accepted_at, revoked_at, workforce_employees(full_name, employee_code), workforce_roles(name)'
    )
    .order('invited_at', { ascending: false })
  if (status) query = query.eq('status', status)
  const { data, error } = await query.returns<InvitationJoinRow[]>()
  if (error) throw new Error(`[workforce] getWorkforceInvitations: ${error.message}`)
  return (data ?? []).map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.workforce_employees?.full_name ?? row.email,
    employeeCode: row.workforce_employees?.employee_code ?? '—',
    email: row.email,
    roleId: row.role_id,
    roleName: row.workforce_roles?.name ?? 'Unknown role',
    status: row.status,
    invitedAt: row.invited_at,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
    revokedAt: row.revoked_at,
  }))
}

export async function getOpenJobsCount(): Promise<number> {
  const supabase = createSupabaseAdminClient()
  const { count, error } = await supabase
    .from('workforce_jobs')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Open')
  if (error) throw new Error(`[workforce] getOpenJobsCount: ${error.message}`)
  return count ?? 0
}
