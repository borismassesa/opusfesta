'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { recordAuditEvent } from '@/lib/audit-log'

// Server actions for partnership leads. The viewer page consumes these
// via small client components that wrap forms / dropdowns.
//
// Permission model: vendor.read can view; vendor.moderate can mutate.
// Marketing & Partnership and Founders both have moderate; viewers can
// see the queue but not change it.

const LEAD_TYPES = ['Brand', 'Agency', 'Vendor', 'Influencer', 'Other'] as const
const LEAD_STATUSES = ['New', 'Contacted', 'Negotiating', 'Closed Won', 'Closed Lost'] as const
const LEAD_SOURCES = ['Web form', 'Email', 'Referral', 'Outreach', 'Event', 'Direct'] as const

export type LeadType = (typeof LEAD_TYPES)[number]
export type LeadStatus = (typeof LEAD_STATUSES)[number]
export type LeadSource = (typeof LEAD_SOURCES)[number]

function clean(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length === 0 ? null : trimmed
}

function isLeadType(value: string | null): value is LeadType {
  return value !== null && (LEAD_TYPES as readonly string[]).includes(value)
}
function isLeadStatus(value: string | null): value is LeadStatus {
  return value !== null && (LEAD_STATUSES as readonly string[]).includes(value)
}
function isLeadSource(value: string | null): value is LeadSource {
  return value !== null && (LEAD_SOURCES as readonly string[]).includes(value)
}

export async function createPartnershipLead(formData: FormData): Promise<void> {
  await requirePermission('vendor.moderate')

  const contactName = clean(formData.get('contact_name'))
  const contactEmail = clean(formData.get('contact_email'))
  if (!contactName) throw new Error('Contact name is required.')
  if (!contactEmail) throw new Error('Contact email is required.')

  const leadType = clean(formData.get('lead_type'))
  const source = clean(formData.get('source'))

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('partnership_leads')
    .insert({
      contact_name: contactName,
      contact_email: contactEmail,
      contact_phone: clean(formData.get('contact_phone')),
      company_name: clean(formData.get('company_name')),
      lead_type: isLeadType(leadType) ? leadType : 'Other',
      source: isLeadSource(source) ? source : 'Direct',
      notes: clean(formData.get('notes')),
    })
    .select('id')
    .single<{ id: string }>()
  if (error) throw error

  void recordAuditEvent({
    eventType: 'partnership_leads.created',
    severity: 'info',
    message: `New partnership lead: ${contactName}`,
    targetResource: `partnership_leads:${data.id}`,
    metadata: { contact_email: contactEmail, lead_type: leadType },
  })

  revalidatePath('/operations/partnerships')
  revalidatePath('/')
}

export async function updateLeadStatus(
  leadId: string,
  status: string,
): Promise<void> {
  await requirePermission('vendor.moderate')
  if (!isLeadStatus(status)) throw new Error(`Invalid status: ${status}`)

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('partnership_leads')
    .update({ status, last_activity_at: new Date().toISOString() })
    .eq('id', leadId)
  if (error) throw error

  void recordAuditEvent({
    eventType: 'partnership_leads.status_changed',
    severity: 'info',
    message: `Lead status → ${status}`,
    targetResource: `partnership_leads:${leadId}`,
    metadata: { status },
  })

  revalidatePath('/operations/partnerships')
  revalidatePath('/')
}
