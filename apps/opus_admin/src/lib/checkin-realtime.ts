'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Browser-side Supabase client, anon key only — used exclusively to receive
 * the door scanner's Realtime Broadcast feed on the admin live check-in
 * page. Never used for table reads/writes (those stay server-only via the
 * service-role client in lib/supabase.ts).
 *
 * DUPLICATED from apps/opus_pass/src/lib/checkin/realtimeClient.ts and
 * apps/opus_scanner/src/lib/realtimeClient.ts — same follow-up note applies
 * (extract into @opusfesta/lib eventually).
 */
export function createCheckinRealtimeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}

export interface CheckinBroadcastPayload {
  status: 'success' | 'duplicate' | 'queued'
  guestName: string
  partySize: number
  doorLabel: string
  at: string
}

export function checkinChannelName(eventId: string): string {
  return `checkin:${eventId}`
}
