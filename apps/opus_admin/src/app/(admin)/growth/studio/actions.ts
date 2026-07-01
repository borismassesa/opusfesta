'use server'

import { revalidatePath } from 'next/cache'
import { hasPermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type ActionResult = { ok: true } | { ok: false; error: string }

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export type BookingInput = {
  bookingDate: string
  sessionDate: string | null
  customerName: string
  service: string
  photographerName: string | null
  videographerName: string | null
  revenueTzs: number
  directCostTzs: number
  deliveryDate: string | null
  satisfaction: number | null
  notes: string | null
}

function validate(input: Partial<BookingInput>): string | null {
  if (input.bookingDate !== undefined && !DATE_RE.test(input.bookingDate)) return 'Invalid booking date.'
  if (input.sessionDate != null && !DATE_RE.test(input.sessionDate)) return 'Invalid session date.'
  if (input.deliveryDate != null && !DATE_RE.test(input.deliveryDate)) return 'Invalid delivery date.'
  if (input.customerName !== undefined && !input.customerName.trim()) return 'Customer name is required.'
  if (input.service !== undefined && !input.service.trim()) return 'Service is required.'
  if (input.revenueTzs !== undefined && !(Number.isFinite(input.revenueTzs) && input.revenueTzs >= 0)) {
    return 'Revenue must be zero or positive.'
  }
  if (input.directCostTzs !== undefined && !(Number.isFinite(input.directCostTzs) && input.directCostTzs >= 0)) {
    return 'Direct cost must be zero or positive.'
  }
  if (
    input.satisfaction != null &&
    !(Number.isFinite(input.satisfaction) && input.satisfaction >= 0 && input.satisfaction <= 5)
  ) {
    return 'Satisfaction must be between 0 and 5.'
  }
  return null
}

function revalidateStudio() {
  revalidatePath('/growth/studio')
  revalidatePath('/growth')
}

export async function addBooking(input: BookingInput): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to log studio bookings." }
  }
  const validationError = validate(input)
  if (validationError) return { ok: false, error: validationError }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_studio_bookings_log').insert({
    booking_date: input.bookingDate,
    session_date: input.sessionDate,
    customer_name: input.customerName.trim(),
    service: input.service.trim(),
    photographer_name: input.photographerName?.trim() || null,
    videographer_name: input.videographerName?.trim() || null,
    revenue_tzs: input.revenueTzs,
    direct_cost_tzs: input.directCostTzs,
    delivery_date: input.deliveryDate,
    satisfaction: input.satisfaction,
    notes: input.notes?.trim() || null,
  })
  if (error) {
    console.error('[growth/studio] addBooking failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateStudio()
  return { ok: true }
}

export async function updateBooking(id: string, patch: Partial<BookingInput>): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to edit studio bookings." }
  }
  const validationError = validate(patch)
  if (validationError) return { ok: false, error: validationError }

  const dbPatch: Record<string, unknown> = {}
  if (patch.bookingDate !== undefined) dbPatch.booking_date = patch.bookingDate
  if (patch.sessionDate !== undefined) dbPatch.session_date = patch.sessionDate
  if (patch.customerName !== undefined) dbPatch.customer_name = patch.customerName.trim()
  if (patch.service !== undefined) dbPatch.service = patch.service.trim()
  if (patch.photographerName !== undefined) dbPatch.photographer_name = patch.photographerName?.trim() || null
  if (patch.videographerName !== undefined) dbPatch.videographer_name = patch.videographerName?.trim() || null
  if (patch.revenueTzs !== undefined) dbPatch.revenue_tzs = patch.revenueTzs
  if (patch.directCostTzs !== undefined) dbPatch.direct_cost_tzs = patch.directCostTzs
  if (patch.deliveryDate !== undefined) dbPatch.delivery_date = patch.deliveryDate
  if (patch.satisfaction !== undefined) dbPatch.satisfaction = patch.satisfaction
  if (patch.notes !== undefined) dbPatch.notes = patch.notes?.trim() || null

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_studio_bookings_log').update(dbPatch).eq('id', id)
  if (error) {
    console.error('[growth/studio] updateBooking failed', error)
    return { ok: false, error: error.message || 'Could not save.' }
  }

  revalidateStudio()
  return { ok: true }
}

export async function deleteBooking(id: string): Promise<ActionResult> {
  if (!(await hasPermission('growth.write'))) {
    return { ok: false, error: "You don't have permission to delete studio bookings." }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_studio_bookings_log').delete().eq('id', id)
  if (error) {
    console.error('[growth/studio] deleteBooking failed', error)
    return { ok: false, error: error.message || 'Could not delete.' }
  }

  revalidateStudio()
  return { ok: true }
}
