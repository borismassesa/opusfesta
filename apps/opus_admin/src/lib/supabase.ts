import { auth } from '@clerk/nextjs/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export class SupabaseAdminConfigError extends Error {
  constructor() {
    super('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    this.name = 'SupabaseAdminConfigError'
  }
}

export function hasSupabaseAdminConfig(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
}

export function isSupabaseAdminConfigError(error: unknown): error is SupabaseAdminConfigError {
  return error instanceof SupabaseAdminConfigError
}

/**
 * Server-side admin client (bypasses RLS via service role).
 * Use for trusted admin writes — never expose to the browser.
 */
export function createSupabaseAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new SupabaseAdminConfigError()
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * Server-side Clerk-authenticated client (subject to RLS).
 * Use for read paths or for writes where RLS should still apply.
 */
export async function createClerkSupabaseServerClient(): Promise<SupabaseClient> {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: token ? { Authorization: `Bearer ${token}` } : {} },
    }
  )
}
