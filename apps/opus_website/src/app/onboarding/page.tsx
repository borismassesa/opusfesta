import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase'
import OnboardingClient from './OnboardingClient'

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

export default async function OnboardingPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = createSupabaseServerClient()

  // Find internal user id — use maybeSingle so a missing row (webhook not yet
  // fired) returns null instead of throwing PGRST116.
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .maybeSingle()

  let existingProfile: CoupleProfile | null = null

  if (userRow) {
    const { data: profile } = await supabase
      .from('couple_profiles')
      .select(
        'partner1_name, partner2_name, wedding_date, date_undecided, city, region, guest_count, budget_range, whatsapp_phone, preferred_categories',
      )
      .eq('user_id', userRow.id)
      .single()

    if (profile) {
      existingProfile = profile as CoupleProfile
    }
  }

  return <OnboardingClient existingProfile={existingProfile} />
}
