'use server'

import { revalidatePath } from 'next/cache'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { requireAdminRole } from '@/lib/admin-auth'
import type { ShiftType } from '../_lib/types'

const SHIFT_TYPES = new Set<ShiftType>([
  'Full day',
  'Half day',
  'On-call',
  'Remote',
  'Off',
])

export type UpsertShiftInput = {
  employeeId: string
  weekday: number
  type: ShiftType
  start?: string
  end?: string
  note?: string
}

export async function upsertShift(input: UpsertShiftInput): Promise<void> {
  await requireAdminRole(['owner', 'admin'])

  if (!SHIFT_TYPES.has(input.type)) throw new Error('Unknown shift type.')
  if (input.weekday < 1 || input.weekday > 7) throw new Error('Weekday must be 1–7.')

  const supabase = createSupabaseAdminClient()
  // Times are TIME columns — Supabase accepts 'HH:MM' or 'HH:MM:SS'.
  const startTime = input.type === 'Off' || input.type === 'On-call' ? null : input.start ?? null
  const endTime = input.type === 'Off' || input.type === 'On-call' ? null : input.end ?? null

  const { error } = await supabase
    .from('workforce_shifts')
    .upsert(
      {
        employee_id: input.employeeId,
        weekday: input.weekday,
        shift_type: input.type,
        start_time: startTime,
        end_time: endTime,
        note: input.note?.trim() || null,
      },
      { onConflict: 'employee_id,weekday' },
    )
  if (error) throw error

  revalidatePath('/workforce/schedule')
}

export async function clearShift(employeeId: string, weekday: number): Promise<void> {
  await requireAdminRole(['owner', 'admin'])
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('workforce_shifts')
    .delete()
    .eq('employee_id', employeeId)
    .eq('weekday', weekday)
  if (error) throw error
  revalidatePath('/workforce/schedule')
}
