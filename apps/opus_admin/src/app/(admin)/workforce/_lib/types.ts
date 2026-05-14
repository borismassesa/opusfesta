// Shared types for the Workforce module. The DB is the source of
// truth for these shapes; the client components consume the mapped
// versions returned by queries.ts.

export type Department =
  | 'Operations'
  | 'Engineering'
  | 'Product'
  | 'Design'
  | 'Marketing'
  | 'Vendor Success'
  | 'Finance'
  | 'People'
  | 'Studio'

export type EmploymentType = 'Permanent' | 'Contract' | 'Probation' | 'Intern'
export type EmployeeStatus = 'Active' | 'On Leave' | 'Onboarding' | 'Resigned'
export type Location = 'Dar es Salaam' | 'Arusha' | 'Zanzibar' | 'Remote'

export type Employee = {
  id: string
  employeeCode: string
  name: string
  email: string
  phone: string
  jobTitle: string
  department: Department
  manager: string | null
  employmentType: EmploymentType
  status: EmployeeStatus
  location: Location
  startDate: string
  salaryTzs: number
  leaveBalanceDays: number
  avatarColor: string
}

export type ShiftType = 'Full day' | 'Half day' | 'On-call' | 'Remote' | 'Off'

export type WorkforceShift = {
  id: string
  employeeId: string
  weekday: number
  type: ShiftType
  start?: string
  end?: string
  note?: string
}

export type PayrollStatus = 'Draft' | 'In review' | 'Approved' | 'Paid'

export type PayrollRun = {
  id: string
  period: string
  payDate: string
  status: PayrollStatus
  headcount: number
  grossTzs: number
  payeTzs: number
  nssfTzs: number
  netTzs: number
}

export type LeaveType =
  | 'Annual'
  | 'Sick'
  | 'Maternity'
  | 'Paternity'
  | 'Compassionate'
  | 'Unpaid'
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled'

export type LeaveRequest = {
  id: string
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  days: number
  status: LeaveStatus
  reason: string
  submittedAt: string
}

export type WorkforceAttendance = {
  id: string
  employeeId: string
  date: string
  clockIn: string | null
  clockOut: string | null
  status: 'Present' | 'Late' | 'Absent' | 'Remote' | 'Leave'
  workedHours: number
}

export type PermissionGroup =
  | 'Website CMS'
  | 'Vendors'
  | 'Bookings'
  | 'Finance'
  | 'Workforce'
  | 'Insights'
  | 'Platform'

export type Permission = {
  key: string
  group: PermissionGroup
  label: string
  description: string
}

export type WorkforceRole = {
  id: string
  slug: string
  name: string
  description: string
  members: number
  permissionKeys: string[]
  isSystem: boolean
}

export type JobStage =
  | 'Applied'
  | 'Screening'
  | 'Interview'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
export type JobStatus = 'Open' | 'On hold' | 'Closed'

export type Candidate = {
  id: string
  name: string
  email: string
  stage: JobStage
  appliedAt: string
  source: 'LinkedIn' | 'Referral' | 'Careers Page' | 'Direct' | 'Brighter Monday'
  rating: 1 | 2 | 3 | 4 | 5
}

export type Job = {
  id: string
  slug: string
  title: string
  department: Department
  location: Location
  type: EmploymentType
  status: JobStatus
  openedAt: string
  postedSalaryTzs: [number, number]
  hiringManager: string
  candidates: Candidate[]
}

// Permission catalog. Kept inline rather than DB-backed because these
// keys are referenced from code (the matrix renders descriptions); the
// only DB state is which permissions a role has, in workforce_roles.permission_keys.
export const PERMISSIONS: Permission[] = [
  { key: 'cms.read', group: 'Website CMS', label: 'View CMS content', description: 'Browse pages, articles and curation queues.' },
  { key: 'cms.write', group: 'Website CMS', label: 'Edit CMS content', description: 'Create and update website content and curation.' },
  { key: 'cms.publish', group: 'Website CMS', label: 'Publish content', description: 'Move drafts to live and revert published items.' },
  { key: 'vendor.read', group: 'Vendors', label: 'View vendor accounts', description: 'See vendor profiles, services and documents.' },
  { key: 'vendor.moderate', group: 'Vendors', label: 'Moderate vendors', description: 'Approve, suspend or update vendor accounts.' },
  { key: 'bookings.read', group: 'Bookings', label: 'View bookings', description: 'Read all booking pipelines across the platform.' },
  { key: 'bookings.write', group: 'Bookings', label: 'Update bookings', description: 'Edit status, dates and quotes.' },
  { key: 'finance.read', group: 'Finance', label: 'View finance', description: 'See invoices, payouts and reconciliation.' },
  { key: 'finance.write', group: 'Finance', label: 'Process payouts', description: 'Trigger transfers and approve refunds.' },
  { key: 'workforce.read', group: 'Workforce', label: 'View workforce', description: 'See employees, schedule and leave.' },
  { key: 'workforce.write', group: 'Workforce', label: 'Edit workforce', description: 'Create employees, edit roles, manage payroll.' },
  { key: 'workforce.payroll', group: 'Workforce', label: 'Run payroll', description: 'Approve and release monthly payroll.' },
  { key: 'insights.read', group: 'Insights', label: 'View analytics', description: 'Access dashboards, exports and audit logs.' },
  { key: 'platform.admin', group: 'Platform', label: 'Manage platform', description: 'Domain settings, secrets, feature flags.' },
]

export const JOB_STAGES: JobStage[] = [
  'Applied',
  'Screening',
  'Interview',
  'Offer',
  'Hired',
  'Rejected',
]

export const DEPARTMENTS: Department[] = [
  'Operations',
  'Engineering',
  'Product',
  'Design',
  'Marketing',
  'Vendor Success',
  'Finance',
  'People',
  'Studio',
]
