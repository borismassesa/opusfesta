'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client, anon key only — used exclusively to receive
 * the door scanner's Realtime Broadcast feed (channel checkin:<eventId>) on
 * the couple's live Check-ins tab. Never used for table reads/writes: those
 * stay server-only via the service-role client, and the check-in roster is
 * fetched server-side. The channel name + payload shape live in ./shared so
 * the server broadcaster and this subscriber can't drift apart.
 *
 * Mirrors apps/opus_admin/src/lib/checkin-realtime.ts (extract into
 * @opusfesta/lib eventually).
 */
export function createCheckinRealtimeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // opus_pass ships the anon key to the browser; PUBLISHABLE_KEY is the newer
  // name for the same public credential, kept as a fallback so this keeps
  // working if the app migrates its env naming.
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}
