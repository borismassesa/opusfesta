import { headers } from 'next/headers'
import { Webhook } from 'svix'
import { createSupabaseAdminClient } from '@/lib/supabase'

type ClerkEmailAddress = { email_address: string; id: string }

type ClerkUserPayload = {
  id: string
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string | null
  first_name: string | null
  last_name: string | null
}

function primaryEmail(payload: ClerkUserPayload): string | null {
  if (!payload.primary_email_address_id) return payload.email_addresses[0]?.email_address ?? null
  return (
    payload.email_addresses.find((e) => e.id === payload.primary_email_address_id)
      ?.email_address ?? null
  )
}

function fullName(payload: ClerkUserPayload): string | null {
  return [payload.first_name, payload.last_name].filter(Boolean).join(' ').trim() || null
}

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET
  if (!secret) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET not set')
    return new Response('Webhook secret not configured', { status: 500 })
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get('svix-id')
  const svixTimestamp = headerPayload.get('svix-timestamp')
  const svixSignature = headerPayload.get('svix-signature')

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response('Missing svix headers', { status: 400 })
  }

  const body = await request.text()
  const wh = new Webhook(secret)

  let event: { type: string; data: ClerkUserPayload }
  try {
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: ClerkUserPayload }
  } catch {
    return new Response('Invalid webhook signature', { status: 400 })
  }

  if (event.type !== 'user.created' && event.type !== 'user.updated') {
    return new Response('Event ignored', { status: 200 })
  }

  const payload = event.data
  const email = primaryEmail(payload)
  const name = fullName(payload)

  if (!email) {
    console.warn(`[clerk-webhook] ${event.type} for ${payload.id} has no email — skipping`)
    return new Response('No email, skipped', { status: 200 })
  }

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('users')
    .upsert(
      {
        clerk_id: payload.id,
        email,
        name,
        password: 'clerk-managed',
      },
      { onConflict: 'clerk_id' },
    )

  if (error) {
    console.error(`[clerk-webhook] users upsert failed for ${payload.id}:`, error)
    return new Response('DB error', { status: 500 })
  }

  console.log(`[clerk-webhook] ${event.type} synced: clerk_id=${payload.id} email=${email}`)
  return new Response('OK', { status: 200 })
}
