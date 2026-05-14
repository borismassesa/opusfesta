'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/admin-auth'
import type { LeaveStatus, LeaveType } from '../_lib/types'

const LEAVE_TYPES = new Set<LeaveType>([
  'Annual',
  'Sick',
  'Maternity',
  'Paternity',
  'Compassionate',
  'Unpaid',
])

function daysBetween(start: string, end: string): number {
  const s = new Date(start)
  const e = new Date(end)
  return Math.max(1, Math.floor((e.getTime() - s.getTime()) / 86400000) + 1)
}

export type SubmitLeaveInput = {
  employeeId: string
  type: LeaveType
  startDate: string
  endDate: string
  reason: string
}

export async function submitLeaveRequest(input: SubmitLeaveInput): Promise<{ id: string }> {
  await requireAdminRole(['owner', 'admin'])

  if (!LEAVE_TYPES.has(input.type)) throw new Error('Pick a known leave type.')
  if (new Date(input.endDate) < new Date(input.startDate)) {
    throw new Error('End date must be on or after the start date.')
  }
  const reason = input.reason.trim()
  if (reason.length < 3) throw new Error('Provide a short reason.')

  const days = daysBetween(input.startDate, input.endDate)
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('workforce_leave_requests')
    .insert({
      employee_id: input.employeeId,
      leave_type: input.type,
      start_date: input.startDate,
      end_date: input.endDate,
      days,
      status: 'Pending',
      reason,
    })
    .select('id')
    .single<{ id: string }>()
  if (error) throw error

  revalidatePath('/workforce/leave')
  return { id: data.id }
}

export async function decideLeaveRequest(id: string, decision: Extract<LeaveStatus, 'Approved' | 'Rejected'>): Promise<void> {
  await requireAdminRole(['owner', 'admin'])

  const supabase = createSupabaseAdminClient()
  // Read the request — we need employee_id + day count for the balance update.
  const { data: req, error: fetchError } = await supabase
    .from('workforce_leave_requests')
    .select('id, employee_id, days, status, leave_type')
    .eq('id', id)
    .single<{ id: string; employee_id: string; days: number; status: LeaveStatus; leave_type: LeaveType }>()
  if (fetchError) throw fetchError
  if (req.status !== 'Pending') {
    throw new Error('Only pending requests can be approved or rejected.')
  }

  const { error: updateError } = await supabase
    .from('workforce_leave_requests')
    .update({ status: decision, reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (updateError) throw updateError

  // Deduct from balance only on approval and only for paid leave types.
  if (decision === 'Approved' && req.leave_type === 'Annual') {
    const { data: emp, error: balanceError } = await supabase
      .from('workforce_employees')
      .select('leave_balance_days')
      .eq('id', req.employee_id)
      .single<{ leave_balance_days: number }>()
    if (balanceError) throw balanceError
    const nextBalance = Math.max(0, emp.leave_balance_days - req.days)
    const { error: deductError } = await supabase
      .from('workforce_employees')
      .update({ leave_balance_days: nextBalance })
      .eq('id', req.employee_id)
    if (deductError) throw deductError
  }

  revalidatePath('/workforce/leave')
  revalidatePath('/workforce/employees')
}

export async function cancelLeaveRequest(id: string): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('workforce_leave_requests')
    .update({ status: 'Cancelled', reviewed_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
  revalidatePath('/workforce/leave')
}

// --- Attendance ---

export type UpsertAttendanceInput = {
  employeeId: string
  date: string
  clockIn?: string | null
  clockOut?: string | null
  status: 'Present' | 'Late' | 'Absent' | 'Remote' | 'Leave'
  workedHours?: number
}

export async function upsertAttendance(input: UpsertAttendanceInput): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('workforce_attendance')
    .upsert(
      {
        employee_id: input.employeeId,
        work_date: input.date,
        clock_in: input.clockIn ?? null,
        clock_out: input.clockOut ?? null,
        status: input.status,
        worked_hours: input.workedHours ?? 0,
      },
      { onConflict: 'employee_id,work_date' },
    )
  if (error) throw error
  revalidatePath('/workforce/leave')
}
