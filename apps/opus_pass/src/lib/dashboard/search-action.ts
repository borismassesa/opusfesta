'use server'

import { createDashboardClient } from './supabase'
import { getDashboardUser } from './auth'

export type SearchResultType = 'guest' | 'event' | 'inquiry'

export type SearchResult = {
  type: SearchResultType
  label: string
  sublabel?: string
  href: string
}

// Global search across the couple's own data, scoped by user_id (and email for
// inquiries). Returns a small set of matches per entity, each linking to the
// page that shows it.
export async function searchDashboard(query: string): Promise<SearchResult[]> {
  const q = query.trim()
  if (q.length < 2) return []

  const user = await getDashboardUser()
  if (!user) return []

  const supabase = createDashboardClient()
  // Strip LIKE wildcards from user input so they're treated literally.
  const like = `%${q.replace(/[\\%_]/g, '')}%`
  const email = user.email?.trim().toLowerCase()

  const [guests, events, inquiries] = await Promise.all([
    supabase
      .from('guest_contacts')
      .select('id, full_name, group_tag')
      .eq('user_id', user.id)
      .ilike('full_name', like)
      .limit(5),
    supabase
      .from('wedding_events')
      .select('id, name')
      .eq('user_id', user.id)
      .ilike('name', like)
      .limit(5),
    email
      ? supabase
          .from('inquiries')
          .select('id, vendor_name')
          .eq('email', email)
          .ilike('vendor_name', like)
          .limit(5)
      : Promise.resolve({ data: [] as Array<{ id: string; vendor_name: string | null }> }),
  ])

  const results: SearchResult[] = []

  for (const g of (guests.data ?? []) as Array<{ id: string; full_name: string | null; group_tag: string | null }>) {
    if (g.full_name) {
      results.push({ type: 'guest', label: g.full_name, sublabel: g.group_tag ?? undefined, href: '/my/dashboard/guests' })
    }
  }
  for (const e of (events.data ?? []) as Array<{ id: string; name: string | null }>) {
    if (e.name) {
      results.push({ type: 'event', label: e.name, href: '/my/dashboard/events' })
    }
  }
  for (const i of (inquiries.data ?? []) as Array<{ id: string; vendor_name: string | null }>) {
    results.push({ type: 'inquiry', label: i.vendor_name ?? 'Vendor', sublabel: 'Vendor inquiry', href: `/my/dashboard/inquiries?id=${i.id}` })
  }

  return results
}
