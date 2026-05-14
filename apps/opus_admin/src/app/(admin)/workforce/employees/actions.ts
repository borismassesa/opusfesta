'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/admin-auth'
import type {
  Department,
  EmployeeStatus,
  EmploymentType,
  Location,
} from '../_lib/types'

const DEPARTMENTS = new Set<Department>([
  'Operations',
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Vendor Success',
  'Finance',
  'People',
  'Studio',
])

const EMPLOYMENT_TYPES = new Set<EmploymentType>([
  'Permanent',
  'Contract',
  'Probation',
  'Intern',
])

const STATUSES = new Set<EmployeeStatus>([
  'Active',
  'On Leave',
  'Onboarding',
  'Resigned',
])

const LOCATIONS = new Set<Location>([
  'Dar es Salaam',
  'Arusha',
  'Zanzibar',
  'Remote',
])

const AVATAR_PALETTE = [
  '#F0DFF6',
  '#FFF3D9',
  '#E5F2FB',
  '#FCE8F0',
  '#DDF6E3',
  '#FFE3D1',
  '#E4E0FB',
  '#D6F0EE',
]

export type CreateEmployeeInput = {
  fullName: string
  email: string
  phone?: string
  jobTitle: string
  department: Department
  employmentType: EmploymentType
  status?: EmployeeStatus
  location: Location
  startDate: string
  salaryTzs: number
  leaveBalanceDays?: number
  managerId?: string | null
}

function assertOrThrow(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function pickAvatarColor(seed: string): string {
  const hash = [...seed].reduce((s, c) => s + c.charCodeAt(0), 0)
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length]
}

async function nextEmployeeCode(): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_employees')
    .select('employee_code')
    .like('employee_code', 'OF-%')
    .order('employee_code', { ascending: false })
    .limit(1)
    .returns<Array<{ employee_code: string }>>()
  if (error) throw error
  const last = data?.[0]?.employee_code
  const lastNum = last ? Number.parseInt(last.replace('OF-', ''), 10) : 0
  const next = Number.isFinite(lastNum) ? lastNum + 1 : 1
  return `OF-${String(next).padStart(3, '0')}`
}

export async function createEmployee(input: CreateEmployeeInput): Promise<{ id: string; employeeCode: string }> {
  await requireAdminRole(['owner', 'admin'])

  const fullName = input.fullName.trim()
  const email = normalizeEmail(input.email)
  const jobTitle = input.jobTitle.trim()

  assertOrThrow(fullName.length > 1, 'Full name is required.')
  assertOrThrow(email.includes('@'), 'A valid email address is required.')
  assertOrThrow(jobTitle.length > 1, 'Job title is required.')
  assertOrThrow(DEPARTMENTS.has(input.department), 'Pick a known department.')
  assertOrThrow(EMPLOYMENT_TYPES.has(input.employmentType), 'Pick a known employment type.')
  assertOrThrow(LOCATIONS.has(input.location), 'Pick a known location.')
  assertOrThrow(input.salaryTzs >= 0, 'Salary must be ≥ 0.')

  const status = input.status ?? 'Onboarding'
  assertOrThrow(STATUSES.has(status), 'Pick a known status.')

  const supabase = createSupabaseAdminClient()
  const employeeCode = await nextEmployeeCode()

  const { data, error } = await supabase
    .from('workforce_employees')
    .insert({
      employee_code: employeeCode,
      full_name: fullName,
      email,
      phone: input.phone?.trim() || null,
      job_title: jobTitle,
      department: input.department,
      manager_id: input.managerId ?? null,
      employment_type: input.employmentType,
      status,
      location: input.location,
      start_date: input.startDate,
      salary_tzs: Math.round(input.salaryTzs),
      leave_balance_days: input.leaveBalanceDays ?? 0,
      avatar_color: pickAvatarColor(email),
    })
    .select('id, employee_code')
    .single<{ id: string; employee_code: string }>()

  if (error) {
    if ((error as { code?: string }).code === '23505') {
      throw new Error(`${email} is already an employee.`)
    }
    throw error
  }

  revalidatePath('/workforce/employees')
  revalidatePath('/workforce/schedule')
  return { id: data.id, employeeCode: data.employee_code }
}

export type UpdateEmployeeInput = Partial<{
  fullName: string
  email: string
  phone: string | null
  jobTitle: string
  department: Department
  employmentType: EmploymentType
  status: EmployeeStatus
  location: Location
  startDate: string
  salaryTzs: number
  leaveBalanceDays: number
  managerId: string | null
}>

export async function updateEmployee(id: string, input: UpdateEmployeeInput): Promise<void> {
  await requireAdminRole(['owner', 'admin'])

  const patch: Record<string, unknown> = {}
  if (input.fullName !== undefined) patch.full_name = input.fullName.trim()
  if (input.email !== undefined) patch.email = normalizeEmail(input.email)
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null
  if (input.jobTitle !== undefined) patch.job_title = input.jobTitle.trim()
  if (input.department !== undefined) {
    assertOrThrow(DEPARTMENTS.has(input.department), 'Pick a known department.')
    patch.department = input.department
  }
  if (input.employmentType !== undefined) {
    assertOrThrow(EMPLOYMENT_TYPES.has(input.employmentType), 'Pick a known employment type.')
    patch.employment_type = input.employmentType
  }
  if (input.status !== undefined) {
    assertOrThrow(STATUSES.has(input.status), 'Pick a known status.')
    patch.status = input.status
  }
  if (input.location !== undefined) {
    assertOrThrow(LOCATIONS.has(input.location), 'Pick a known location.')
    patch.location = input.location
  }
  if (input.startDate !== undefined) patch.start_date = input.startDate
  if (input.salaryTzs !== undefined) {
    assertOrThrow(input.salaryTzs >= 0, 'Salary must be ≥ 0.')
    patch.salary_tzs = Math.round(input.salaryTzs)
  }
  if (input.leaveBalanceDays !== undefined) {
    assertOrThrow(input.leaveBalanceDays >= 0, 'Leave balance must be ≥ 0.')
    patch.leave_balance_days = input.leaveBalanceDays
  }
  if (input.managerId !== undefined) patch.manager_id = input.managerId

  if (Object.keys(patch).length === 0) return

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('workforce_employees').update(patch).eq('id', id)
  if (error) throw error

  revalidatePath('/workforce/employees')
  revalidatePath('/workforce/schedule')
  revalidatePath('/workforce/payroll')
}

export async function setEmployeeStatus(id: string, status: EmployeeStatus): Promise<void> {
  await updateEmployee(id, { status })
}

export async function deleteEmployee(id: string): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('workforce_employees').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/employees')
  revalidatePath('/workforce/schedule')
}
