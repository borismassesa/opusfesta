'use server'

import { revalidatePath } from 'next/cache'
import { requirePermission } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'

export type ActionResult = { ok: true } | { ok: false; error: string }

export type CampaignInput = {
  startDate: string
  endDate: string | null
  campaignName: string
  channel: string
  ownerName: string
  spendTzs: number
  reach: number
  leads: number
  bookings: number
  revenueTzs: number
  notes: string
}

function validate(input: Partial<CampaignInput>): string | null {
  if (input.campaignName !== undefined && !input.campaignName.trim()) return 'Campaign name is required.'
  if (input.startDate !== undefined && !input.startDate) return 'Start date is required.'
  if (input.spendTzs !== undefined && !Number.isFinite(input.spendTzs)) return 'Spend must be a number.'
  if (input.reach !== undefined && !Number.isFinite(input.reach)) return 'Reach must be a number.'
  if (input.leads !== undefined && !Number.isFinite(input.leads)) return 'Leads must be a number.'
  if (input.bookings !== undefined && !Number.isFinite(input.bookings)) return 'Bookings must be a number.'
  if (input.revenueTzs !== undefined && !Number.isFinite(input.revenueTzs)) return 'Revenue must be a number.'
  return null
}

function revalidate() {
  revalidatePath('/growth/marketing')
  revalidatePath('/growth')
}

export async function addCampaign(input: CampaignInput): Promise<ActionResult> {
  try {
    await requirePermission('growth.write')
  } catch {
    return { ok: false, error: "You don't have permission to log Growth Tracker data." }
  }

  const validationError = validate(input)
  if (validationError) return { ok: false, error: validationError }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_marketing_campaigns').insert({
    start_date: input.startDate,
    end_date: input.endDate,
    campaign_name: input.campaignName.trim(),
    channel: input.channel,
    owner_name: input.ownerName.trim(),
    spend_tzs: Math.round(input.spendTzs),
    reach: Math.round(input.reach),
    leads: Math.round(input.leads),
    bookings: Math.round(input.bookings),
    revenue_tzs: Math.round(input.revenueTzs),
    notes: input.notes.trim() || null,
  })
  if (error) {
    console.error('[growth/marketing] addCampaign failed', error)
    return { ok: false, error: error.message || 'Could not save the campaign.' }
  }

  revalidate()
  return { ok: true }
}

export async function updateCampaign(id: string, patch: Partial<CampaignInput>): Promise<ActionResult> {
  try {
    await requirePermission('growth.write')
  } catch {
    return { ok: false, error: "You don't have permission to log Growth Tracker data." }
  }

  const validationError = validate(patch)
  if (validationError) return { ok: false, error: validationError }

  const row: Record<string, unknown> = {}
  if (patch.startDate !== undefined) row.start_date = patch.startDate
  if (patch.endDate !== undefined) row.end_date = patch.endDate
  if (patch.campaignName !== undefined) row.campaign_name = patch.campaignName.trim()
  if (patch.channel !== undefined) row.channel = patch.channel
  if (patch.ownerName !== undefined) row.owner_name = patch.ownerName.trim()
  if (patch.spendTzs !== undefined) row.spend_tzs = Math.round(patch.spendTzs)
  if (patch.reach !== undefined) row.reach = Math.round(patch.reach)
  if (patch.leads !== undefined) row.leads = Math.round(patch.leads)
  if (patch.bookings !== undefined) row.bookings = Math.round(patch.bookings)
  if (patch.revenueTzs !== undefined) row.revenue_tzs = Math.round(patch.revenueTzs)
  if (patch.notes !== undefined) row.notes = patch.notes.trim() || null

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_marketing_campaigns').update(row).eq('id', id)
  if (error) {
    console.error('[growth/marketing] updateCampaign failed', error)
    return { ok: false, error: error.message || 'Could not update the campaign.' }
  }

  revalidate()
  return { ok: true }
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  try {
    await requirePermission('growth.write')
  } catch {
    return { ok: false, error: "You don't have permission to log Growth Tracker data." }
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('growth_marketing_campaigns').delete().eq('id', id)
  if (error) {
    console.error('[growth/marketing] deleteCampaign failed', error)
    return { ok: false, error: error.message || 'Could not delete the campaign.' }
  }

  revalidate()
  return { ok: true }
}
