import { NextResponse, type NextRequest } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
}

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase() ?? ''
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
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
