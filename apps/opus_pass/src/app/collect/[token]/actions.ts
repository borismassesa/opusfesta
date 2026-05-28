'use server'

import { revalidatePath } from 'next/cache'
import { createDashboardClient } from '@/lib/dashboard/supabase'

export interface CollectorEntryInput {
  full_name: string
  phone: string | null
  email: string | null
}

/**
 * Public submission from /collect/<token>: looks up the owner by token, then
 * inserts a guest_contacts row scoped to that owner. The token alone authorizes
 * the write — there's no signed-in session here. We bypass RLS via the
 * service-role client, but every row is scoped to a verified user_id.
 */
export async function submitCollectorEntry(token: string, input: CollectorEntryInput): Promise<void> {
  const cleanName = input.full_name.trim()
  if (!cleanName) throw new Error('Name is required')

  const supabase = createDashboardClient()
  const { data: owner } = await supabase
    .from('users')
    .select('id')
    .eq('collector_token', token)
    .maybeSingle<{ id: string }>()
  if (!owner) throw new Error('Invalid collector link')

  const phone = input.phone?.trim() || null
  const email = input.email?.trim() || null

  const { error } = await supabase.from('guest_contacts').insert({
    user_id: owner.id,
    full_name: cleanName,
    phone,
    whatsapp_phone: phone,
    email,
    group_tag: 'From Contact Collector',
    notes: 'Self-submitted via /collect link',
  })
  if (error) throw new Error(error.message)

  revalidatePath('/my/dashboard/guests')
  revalidatePath('/my/dashboard')
}
