'use client'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export type { CheckinBroadcastPayload } from './broadcastShared'
export { checkinChannelName } from './broadcastShared'

/**
 * Browser-side Supabase client, anon key only — used exclusively for
 * Realtime Broadcast (not table reads/writes, which stay server-only and
 * service-role). No app in this repo has needed a client-side Supabase
 * client before this; keep it scoped to broadcast subscriptions.
 */
export function createRealtimeClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createClient(url, key, { auth: { persistSession: false } })
}
