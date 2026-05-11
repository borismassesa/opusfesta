import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import PlanningClient from './PlanningClient'

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

export default async function PlanningPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = createSupabaseServerClient()

  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle<{ id: string }>()

  let profile: CoupleProfile | null = null

  if (userRow) {
    const { data } = await supabase
      .from('couple_profiles')
      .select('partner1_name, partner2_name, wedding_date, date_undecided, city, region, guest_count, budget_range, whatsapp_phone, preferred_categories')
      .eq('user_id', userRow.id)
      .maybeSingle<CoupleProfile>()
    profile = data
  }

  return <PlanningClient userId={userId} profile={profile} />
}
