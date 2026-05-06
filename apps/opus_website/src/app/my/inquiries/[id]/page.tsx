import { notFound, redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import InquiryThread from './InquiryThread'

type InquiryStatus = 'pending' | 'responded' | 'accepted' | 'declined' | 'closed'

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
  searchParams: Promise<{ email?: string }>
}

export default async function InquiryDetailPage({ params, searchParams }: Props) {
  const { id } = await params
  const { email } = await searchParams

  if (!email) {
    redirect(`/my/inquiries`)
  }

  const normalizedEmail = email.trim().toLowerCase()
  const supabase = createSupabaseServerClient()

  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .select(
      'id, vendor_name, vendor_slug, name, email, status, created_at, event_date, location, guest_count, budget, message, vendor_response, responded_at',
    )
    .eq('id', id)
    .eq('email', normalizedEmail)
    .maybeSingle()

  if (inquiryErr || !inquiry) {
    notFound()
  }

  const { data: messages } = await supabase
    .from('inquiry_messages')
    .select('id, sender_type, sender_name, content, created_at, read_at')
    .eq('inquiry_id', id)
    .order('created_at', { ascending: true })

  return (
    <InquiryThread
      inquiry={inquiry as InquiryDetail}
      messages={(messages ?? []) as InquiryMessage[]}
      email={normalizedEmail}
    />
  )
}
