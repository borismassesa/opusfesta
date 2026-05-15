import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import ProfileClient from './ProfileClient'

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
  whatsapp_phone: string | null
  preferred_categories: string[] | null
}

export default async function ProfilePage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const [clerkUser, profile] = await Promise.all([
    currentUser().catch(() => null),
    fetchProfile(userId).catch(() => null),
  ])

  return (
    <ProfileClient
      clerkName={[clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(' ') || null}
      clerkEmail={clerkUser?.emailAddresses?.[0]?.emailAddress ?? null}
      clerkImageUrl={clerkUser?.imageUrl ?? null}
      profile={profile}
    />
  )
}

async function fetchProfile(clerkId: string): Promise<CoupleProfile | null> {
  const supabase = createSupabaseServerClient()
  const { data: userRow, error: userErr } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', clerkId)
    .maybeSingle<{ id: string }>()

  if (userErr) console.error('[profile-page] user lookup failed', userErr.code)
  if (!userRow) return null

  const { data, error: profileErr } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, wedding_date, date_undecided, city, region, guest_count, budget_range, whatsapp_phone, preferred_categories')
    .eq('user_id', userRow.id)
    .maybeSingle<CoupleProfile>()

  if (profileErr) console.error('[profile-page] profile lookup failed', profileErr.code)
  return data ?? null
}
