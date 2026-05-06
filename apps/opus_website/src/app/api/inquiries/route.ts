import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'

// Public endpoint — no auth required. RLS policy "Anyone can create inquiries"
// allows anon INSERT; we use the service role here so the insert always lands
// even before the RLS anon policy is confirmed applied in all envs.

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function nullIfBlank(value: string | undefined | null): string | null {
  if (!value) return null
  const t = value.trim()
  return t.length === 0 ? null : t
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function isValidDate(value: string): boolean {
  const d = new Date(value)
  return !isNaN(d.getTime())
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body required' }, { status: 400 })
  }

  const {
    vendorId,
    vendorName,
    firstName,
    lastName,
    email,
    phone,
    weddingDate,
    flexibleDate,
    guests,
    message,
  } = body as Record<string, unknown>

  // Required field validation
  if (!vendorId || typeof vendorId !== 'string' || !vendorId.trim()) {
    return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
  }
  if (!firstName || typeof firstName !== 'string' || !firstName.trim()) {
    return NextResponse.json({ error: 'First name is required' }, { status: 400 })
  }
  if (!lastName || typeof lastName !== 'string' || !lastName.trim()) {
    return NextResponse.json({ error: 'Last name is required' }, { status: 400 })
  }
  if (!email || typeof email !== 'string' || !validateEmail(email)) {
    return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 })
  }
  if (!weddingDate || typeof weddingDate !== 'string' || !weddingDate.trim()) {
    return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 })
  }
  if (!guests || typeof guests !== 'string' || !guests.trim()) {
    return NextResponse.json({ error: 'Guest count is required' }, { status: 400 })
  }

  const name = `${(firstName as string).trim()} ${(lastName as string).trim()}`

  // Try to parse weddingDate as a proper date for the DB date column;
  // fall back to storing it in the message if it's a free-text value.
  const parsedDate = isValidDate(weddingDate as string)
    ? new Date(weddingDate as string).toISOString().split('T')[0]
    : null

  const guestCount = parseInt(guests as string, 10)

  const noteLines: string[] = []
  if (message && typeof message === 'string' && message.trim()) {
    noteLines.push(message.trim())
  }
  if (!parsedDate) {
    noteLines.push(`Wedding date (as entered): ${weddingDate}`)
  }
  if (flexibleDate === true) {
    noteLines.push('Date is flexible.')
  }

  const slug = (vendorId as string).trim()
  // vendor_id is UUID FK (nullable). Set it only for marketplace vendors with
  // a proper UUID; CMS/website vendors use slug IDs (text) so they get NULL.
  const vendorUuid = UUID_RE.test(slug) ? slug : null

  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('inquiries')
    .insert({
      vendor_id: vendorUuid,
      vendor_slug: slug,
      vendor_name: nullIfBlank(vendorName as string | undefined),
      name,
      email: (email as string).trim().toLowerCase(),
      phone: nullIfBlank(phone as string | undefined),
      event_type: 'wedding',
      event_date: parsedDate,
      guest_count: isNaN(guestCount) ? null : guestCount,
      message: noteLines.join('\n\n'),
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[inquiries] insert failed', error)
    return NextResponse.json(
      { error: 'Unable to send your request. Please try again.' },
      { status: 500 },
    )
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
