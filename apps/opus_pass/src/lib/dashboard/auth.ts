import 'server-only'
import { redirect } from 'next/navigation'

export interface DashboardUser {
  /** Supabase users.id (UUID) */
  id: string
  clerkId: string
  email: string | null
  name: string | null
}

// NOTE: Clerk auth has been temporarily removed (no production keys configured).
// The couple dashboard under /my is disabled — `app/my/layout.tsx` redirects to
// the home page, so these helpers are not reached at runtime. They remain so the
// dashboard queries/actions continue to type-check until auth is re-introduced.

export async function getDashboardUser(): Promise<DashboardUser | null> {
  return null
}

export async function requireDashboardUser(): Promise<DashboardUser> {
  // Auth disabled — bounce anything that still reaches here back to home.
  redirect('/')
}
