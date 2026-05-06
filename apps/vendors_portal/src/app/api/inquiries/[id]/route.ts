import { NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { getCurrentVendor } from '@/lib/vendor'

const ALLOWED_STATUSES = ['responded', 'accepted', 'declined', 'closed'] as const
type AllowedStatus = (typeof ALLOWED_STATUSES)[number]

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const state = await getCurrentVendor()
  if (state.kind !== 'live') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const vendorId = state.vendor.id

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { status, vendor_response } = body as Record<string, unknown>

  if (status !== undefined && !ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return NextResponse.json(
      { error: `status must be one of: ${ALLOWED_STATUSES.join(', ')}` },
      { status: 400 },
    )
  }

  // Confirm the inquiry belongs to this vendor before writing
  const supabase = createSupabaseAdminClient()
  const { data: existing } = await supabase
    .from('inquiries')
    .select('id, vendor_id')
    .eq('id', id)
    .eq('vendor_id', vendorId)
    .maybeSingle()

  if (!existing) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 })
  }

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (status) update.status = status
  if (typeof vendor_response === 'string' && vendor_response.trim()) {
    update.vendor_response = vendor_response.trim()
    update.responded_at = new Date().toISOString()
    if (!status) update.status = 'responded'
  }

  const { error } = await supabase
    .from('inquiries')
    .update(update)
    .eq('id', id)

  if (error) {
    console.error('[inquiries] update failed', error)
    return NextResponse.json({ error: 'Update failed. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
