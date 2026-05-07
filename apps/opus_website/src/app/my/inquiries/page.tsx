import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import InquiriesClient from './InquiriesClient'

export const dynamic = 'force-dynamic'

type InquirySummary = {
  id: string
  vendor_name: string | null
  vendor_slug: string | null
  status: 'pending' | 'responded' | 'accepted' | 'declined' | 'closed' | null
  created_at: string
  event_date: string | null
  location: string | null
  guest_count: number | null
}

export default async function InquiriesPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser().catch(() => null)
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null

  let initialInquiries: InquirySummary[] | null = null

  if (email) {
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('inquiries')
      .select('id, vendor_name, vendor_slug, status, created_at, event_date, location, guest_count')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(30)
    initialInquiries = (data ?? []) as InquirySummary[]
  }

  return (
    <InquiriesClient
      initialEmail={email}
      initialInquiries={initialInquiries}
    />
  )
}
