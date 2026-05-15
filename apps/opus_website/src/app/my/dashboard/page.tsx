import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

type CoupleProfile = {
  partner1_name: string | null
  partner2_name: string | null
  wedding_date: string | null
  date_undecided: boolean | null
  city: string | null
  region: string | null
  guest_count: number | null
  budget_range: string | null
  preferred_categories: string[] | null
}

type InquirySummary = {
  total: number
  pending: number
  responded: number
  accepted: number
  declined: number
  closed: number
}

type RecentInquiry = {
  id: string
  vendor_name: string | null
  vendor_slug: string | null
  status: string | null
  created_at: string
  event_date: string | null
  location: string | null
}

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const clerkUser = await currentUser().catch(() => null)
  const email = clerkUser?.emailAddresses?.[0]?.emailAddress ?? null
  const clerkName = [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null

  const supabase = createSupabaseServerClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle<{ id: string }>()

  const [profileResult, inquiriesResult] = await Promise.all([
    userRow
      ? supabase
          .from('couple_profiles')
          .select('partner1_name, partner2_name, wedding_date, date_undecided, city, region, guest_count, budget_range, preferred_categories')
          .eq('user_id', userRow.id)
          .maybeSingle<CoupleProfile>()
      : Promise.resolve({ data: null, error: null }),
    email
      ? supabase
          .from('inquiries')
          .select('id, vendor_name, vendor_slug, status, created_at, event_date, location')
          .eq('email', email)
          .order('created_at', { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [], error: null }),
  ])

  if (profileResult.error) console.error('[dashboard] profile fetch failed', profileResult.error.code)
  if (inquiriesResult.error) console.error('[dashboard] inquiries fetch failed', inquiriesResult.error.code)

  const inquiries = (inquiriesResult.data ?? []) as RecentInquiry[]

  const inquirySummary: InquirySummary = {
    total: inquiries.length,
    pending: inquiries.filter(i => i.status === 'pending').length,
    responded: inquiries.filter(i => i.status === 'responded').length,
    accepted: inquiries.filter(i => i.status === 'accepted').length,
    declined: inquiries.filter(i => i.status === 'declined').length,
    closed: inquiries.filter(i => i.status === 'closed').length,
  }

  return (
    <DashboardClient
      clerkUserId={userId}
      clerkName={clerkName}
      clerkEmail={email}
      profile={profileResult.data ?? null}
      inquirySummary={inquirySummary}
      recentInquiries={inquiries.slice(0, 6)}
    />
  )
}
