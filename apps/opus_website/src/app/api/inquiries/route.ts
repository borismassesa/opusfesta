import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { sendEmail } from '@/lib/email/email'
import { buildInquiryClientConfirmationEmail } from '@/lib/email/inquiry-client-confirmation-email'
import { buildInquiryVendorNotificationEmail } from '@/lib/email/inquiry-vendor-notification-email'

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
  if (email.length > 254) return false
  return /^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email.trim())
}

function isValidDate(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string' || !value.trim()) return false
  const d = new Date(value)
  return !isNaN(d.getTime())
}

function parseVendorEmail(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null
  const record = payload as Record<string, unknown>
  const candidates = [
    record.email,
    record.contact_email,
    record.business_email,
    record.owner_email,
    record.primary_email,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim().toLowerCase()
    }
  }
  return null
}

async function resolveVendorNotificationTarget(supabase: ReturnType<typeof createSupabaseServerClient>, args: {
  vendorUuid: string | null
  slug: string
  vendorName: string | null
}): Promise<{ email: string | null; name: string }> {
  const fallbackName = args.vendorName?.trim() || 'Vendor'

  const { data, error } = args.vendorUuid
    ? await supabase
        .from('vendors')
        .select('business_name, contact_info, application_snapshot')
        .eq('id', args.vendorUuid)
        .maybeSingle()
    : await supabase
        .from('vendors')
        .select('business_name, contact_info, application_snapshot')
        .eq('slug', args.slug)
        .maybeSingle()

  if (error || !data) {
    return { email: null, name: fallbackName }
  }

  const vendorName =
    (typeof data.business_name === 'string' && data.business_name.trim())
      ? data.business_name.trim()
      : fallbackName

  const email =
    parseVendorEmail(data.contact_info)
    ?? parseVendorEmail(data.application_snapshot)

  return { email, name: vendorName }
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
    location,
    budget,
    interestedPackage,
    message,
    emailNotifications,
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
    // Date is only required when the client didn't mark it as flexible
    if (!flexibleDate) {
      return NextResponse.json({ error: 'Wedding date is required' }, { status: 400 })
    }
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
  if (interestedPackage && typeof interestedPackage === 'string' && interestedPackage.trim()) {
    noteLines.push(`Interested package: ${interestedPackage.trim()}`)
  }
  if (message && typeof message === 'string' && message.trim()) {
    noteLines.push(message.trim())
  }
  if (!parsedDate && weddingDate && typeof weddingDate === 'string' && weddingDate.trim()) {
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
      location: nullIfBlank(location as string | undefined),
      budget: nullIfBlank(budget as string | undefined),
      message: noteLines.join('\n\n'),
      email_notifications_opt_in: emailNotifications === true,
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

  // If the request came from an authenticated Clerk user, link inquiry to them
  try {
    const { userId } = await auth()
    if (userId) {
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single()

      if (userRow) {
        await supabase
          .from('inquiries')
          .update({ user_id: userRow.id })
          .eq('id', data.id)
      }
    }
  } catch {
    // Non-critical: don't fail the request if user linking fails
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3006'
  const inquiryUrl = `${appUrl.replace(/\/$/, '')}/my/inquiries/${data.id}?email=${encodeURIComponent((email as string).trim().toLowerCase())}`

  try {
    const clientEmailPayload = buildInquiryClientConfirmationEmail({
      clientName: name,
      vendorName: nullIfBlank(vendorName as string | undefined) ?? 'Vendor',
      inquiryId: data.id,
      inquiryUrl,
      weddingDate: parsedDate,
      guestCount: typeof guests === 'string' && guests.trim() ? guests.trim() : null,
      location: nullIfBlank(location as string | undefined),
    })

    const vendorTarget = await resolveVendorNotificationTarget(supabase, {
      vendorUuid,
      slug,
      vendorName: nullIfBlank(vendorName as string | undefined),
    })

    const mailJobs: Array<Promise<unknown>> = [
      sendEmail({
        to: (email as string).trim().toLowerCase(),
        subject: clientEmailPayload.subject,
        html: clientEmailPayload.html,
        text: clientEmailPayload.text,
      }),
    ]

    if (vendorTarget.email) {
      const vendorPayload = buildInquiryVendorNotificationEmail({
        vendorName: vendorTarget.name,
        clientName: name,
        clientEmail: (email as string).trim().toLowerCase(),
        phone: nullIfBlank(phone as string | undefined),
        weddingDate: parsedDate,
        guestCount: typeof guests === 'string' && guests.trim() ? guests.trim() : null,
        location: nullIfBlank(location as string | undefined),
        message: noteLines.join('\n\n') || null,
        portalUrl: process.env.VENDOR_PORTAL_URL ?? 'https://vendors.opusfesta.com',
      })

      mailJobs.push(
        sendEmail({
          to: vendorTarget.email,
          subject: vendorPayload.subject,
          html: vendorPayload.html,
          text: vendorPayload.text,
          replyTo: (email as string).trim().toLowerCase(),
        }),
      )
    }

    await Promise.allSettled(mailJobs)
  } catch (emailError) {
    console.warn('[inquiries] email notifications failed', emailError)
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201 })
}
