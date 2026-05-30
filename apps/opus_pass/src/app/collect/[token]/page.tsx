import { notFound } from 'next/navigation'
import { createDashboardClient } from '@/lib/dashboard/supabase'
import type { PledgePageConfig } from '@/lib/dashboard/pledge-page'
import CollectorForm from './CollectorForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ token: string }>
}

interface CoupleSummary {
  userId: string
  coupleName: string
  weddingDate: string | null
  city: string | null
  config: PledgePageConfig
}

async function loadCouple(token: string): Promise<CoupleSummary | null> {
  const supabase = createDashboardClient()
  const { data: owner, error: ownerErr } = await supabase
    .from('users')
    .select('id')
    .eq('collector_token', token)
    .maybeSingle<{ id: string }>()
  if (ownerErr) {
    console.error('[collect] owner lookup failed', ownerErr)
    throw ownerErr
  }
  if (!owner) return null

  const { data: profile, error: profileErr } = await supabase
    .from('couple_profiles')
    .select('partner1_name, partner2_name, wedding_date, city, collector_page')
    .eq('user_id', owner.id)
    .maybeSingle<{
      partner1_name: string | null
      partner2_name: string | null
      wedding_date: string | null
      city: string | null
      collector_page: PledgePageConfig | null
    }>()
  if (profileErr) {
    console.error('[collect] couple profile load failed', profileErr)
    throw profileErr
  }

  const names = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  return {
    userId: owner.id,
    coupleName: names.length ? names.join(' & ') : 'The Couple',
    weddingDate: profile?.wedding_date ?? null,
    city: profile?.city ?? null,
    config: profile?.collector_page ?? {},
  }
}

export default async function CollectorPage({ params }: PageProps) {
  const { token } = await params
  const couple = await loadCouple(token)
  if (!couple) notFound()
  return (
    <CollectorForm
      token={token}
      coupleName={couple.coupleName}
      weddingDate={couple.weddingDate}
      city={couple.city}
      config={couple.config}
    />
  )
}
