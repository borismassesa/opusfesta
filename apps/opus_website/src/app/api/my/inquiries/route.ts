import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const clerkUser = await currentUser().catch(() => null)
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: 'Could not resolve user email' }, { status: 400 })
  }

  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from('inquiries')
    .select('id, vendor_name, vendor_slug, status, created_at, event_date, location, guest_count')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[my/inquiries] list failed', error)
    return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 })
  }

  return NextResponse.json({ inquiries: data ?? [] })
}
