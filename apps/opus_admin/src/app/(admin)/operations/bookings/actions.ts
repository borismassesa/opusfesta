'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { recordAuditEvent } from '@/lib/audit-log'

// Server actions for the booking inquiry pipeline. The list page consumes
// these via the inline StatusCell dropdown.
//
// Permission model: bookings.read can view the pipeline; bookings.write can
// move an inquiry between statuses.

const INQUIRY_STATUSES = [
  'pending',
  'responded',
  'accepted',
  'declined',
  'closed',
] as const

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number]

function isInquiryStatus(value: string): value is InquiryStatus {
  return (INQUIRY_STATUSES as readonly string[]).includes(value)
}

export async function updateInquiryStatus(
  inquiryId: string,
  status: string,
): Promise<void> {
  await requirePermission('bookings.write')
  if (!isInquiryStatus(status)) throw new Error(`Invalid status: ${status}`)

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('inquiries')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', inquiryId)
  if (error) throw error

  void recordAuditEvent({
    eventType: 'inquiries.status_changed',
    severity: 'info',
    message: `Inquiry status → ${status}`,
    targetResource: `inquiries:${inquiryId}`,
    metadata: { status },
  })

  revalidatePath('/operations/bookings')
  revalidatePath('/')
}
