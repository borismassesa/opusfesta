import 'server-only'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// Cookie-aware Supabase client for Server Components, Route Handlers, and
// Server Actions. Reads the user session from cookies set by the magic-link
// callback. RLS is enforced as the authenticated user.
//
// For service-role access (RLS-bypassing, owner-checked in app code), use
// `createSupabaseServerClient` from './supabase' or `createDashboardClient`
// from './dashboard/supabase'.

export async function createSupabaseAuthClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  const cookieStore = await cookies()
  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options as CookieOptions)
          }
        } catch {
          // Server Components can't set cookies; that's fine — middleware /
          // route handlers handle session refresh.
        }
      },
    },
  })
}
