import { notFound, redirect } from 'next/navigation'
import { auth, currentUser } from '@clerk/nextjs/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { verifyInquiryToken } from '@/lib/inquiry-token'
import InquiryThread from './InquiryThread'

type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed'
type ProposalStatus = 'sent' | 'countered' | 'accepted'

export type InquiryDetail = {
  id: string
  vendor_name: string | null
  vendor_slug: string | null
  name: string | null
  email: string
  status: InquiryStatus | null
  created_at: string
  event_date: string | null
  location: string | null
  guest_count: number | null
  budget: string | null
  message: string | null
  vendor_response: string | null
  responded_at: string | null
  proposal_status: ProposalStatus | null
  proposal_event_date: string | null
  proposal_venue: string | null
  proposal_guest_count: number | null
  proposal_package: string | null
  proposal_invoice_amount: number | null
  proposal_invoice_details: string | null
  proposal_sent_at: string | null
  proposal_counter_amount: number | null
  proposal_counter_message: string | null
  proposal_countered_at: string | null
  proposal_accepted_at: string | null
}

export type InquiryMessage = {
  id: string
  sender_type: 'client' | 'vendor'
  sender_name: string
  content: string
  created_at: string
  read_at: string | null
}

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ access_token?: string; email?: string }>
}

export default async function InquiryDetailPage({ params, searchParams }: Readonly<Props>) {
  const { id } = await params
  const { access_token, email: emailParam } = await searchParams

  let normalizedEmail: string | null = null

  // Try token-based access first (supports unauthenticated access)
  if (access_token) {
    const tokenPayload = verifyInquiryToken(access_token)
    if (tokenPayload && tokenPayload.inquiryId === id) {
      normalizedEmail = tokenPayload.email.toLowerCase()
    } else {
      // Invalid or expired token
      notFound()
    }
  }

  // Fall back to authenticated Clerk user
  if (!normalizedEmail) {
    const { userId } = await auth()
    if (!userId) {
      redirect('/sign-in')
    }

    const clerkUser = await currentUser().catch(() => null)
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase()
    if (!email) {
      redirect('/my/inquiries')
    }
    normalizedEmail = email
  }

  const supabase = createSupabaseServerClient()

  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select(
      'id, vendor_name, vendor_slug, name, email, status, created_at, event_date, location, guest_count, budget, message, vendor_response, responded_at, proposal_status, proposal_event_date, proposal_venue, proposal_guest_count, proposal_package, proposal_invoice_amount, proposal_invoice_details, proposal_sent_at, proposal_counter_amount, proposal_counter_message, proposal_countered_at, proposal_accepted_at',
    )
    .eq('id', id)
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (inquiryErr) {
    console.error('[inquiry-detail] query failed', inquiryErr.code)
    notFound()
  }

  if (!inquiry) {
    notFound()
  }

  const { data: messages, error: messagesErr } = await supabase
    .from('inquiry_messages')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  if (messagesErr) console.error('[inquiry-detail] messages query failed', messagesErr.code)

  return (
    <InquiryThread
      inquiry={inquiry as InquiryDetail}
      messages={(messages ?? []) as InquiryMessage[]}
      email={normalizedEmail}
    />
  )
}
