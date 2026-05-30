'use server'

import { revalidatePath } from 'next/cache'
import { createDashboardClient } from '@/lib/dashboard/supabase'

export interface PublicPledgeInput {
  full_name: string
  phone: string | null
  email: string | null
  amount: number
  promised_date: string | null
  message: string | null
}

/**
 * Public submission from /pledge/<token>: looks up the owner by their pledge
 * token, creates a guest_contacts row for the contributor, then an event_pledges
 * row (status 'pledged') scoped to that owner. The token alone authorizes the
 * write — there's no signed-in session — so we use the service-role client but
 * scope every row to the verified user_id. Mirrors submitCollectorEntry.
 */
export async function submitPublicPledge(token: string, input: PublicPledgeInput): Promise<void> {
  const cleanName = input.full_name.trim()
  if (!cleanName) throw new Error('Name is required')
  const amount = Math.max(0, Number(input.amount) || 0)
  if (amount <= 0) throw new Error('Please enter the amount you can pledge')

  const supabase = createDashboardClient()
  const { data: owner, error: ownerErr } = await supabase
    .from('users')
    .select('id')
    .eq('pledge_token', token)
    .maybeSingle<{ id: string }>()
  if (ownerErr) {
    console.error('[pledge] owner lookup failed', ownerErr)
    throw new Error('Something went wrong — please try again in a moment.')
  }
  if (!owner) throw new Error('Invalid pledge link')

  const phone = input.phone?.trim() || null
  const email = input.email?.trim() || null

  const { data: contact, error: contactErr } = await supabase
    .from('guest_contacts')
    .insert({
      user_id: owner.id,
      full_name: cleanName,
      phone,
      whatsapp_phone: phone,
      email,
      group_tag: 'From Pledge link',
      notes: 'Self-submitted via /pledge link',
    })
    .select('id')
    .single<{ id: string }>()
  if (contactErr || !contact) throw new Error(contactErr?.message ?? 'Could not save your pledge')

  const { error: pledgeErr } = await supabase.from('event_pledges').insert({
    user_id: owner.id,
    guest_contact_id: contact.id,
    pledged_amount: amount,
    currency: 'TZS',
    promised_date: input.promised_date || null,
    status: 'pledged',
    notes: input.message?.trim() || null,
  })
  if (pledgeErr) throw new Error(pledgeErr.message)

  revalidatePath('/my/dashboard/pledges')
  revalidatePath('/my/dashboard/guests')
  revalidatePath('/my/dashboard')
}
