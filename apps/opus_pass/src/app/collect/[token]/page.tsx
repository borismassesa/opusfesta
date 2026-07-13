import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createDashboardClient } from '@/lib/dashboard/supabase'
import type { PledgePageConfig } from '@/lib/dashboard/pledge-page'
import { getLocale } from '@/lib/cms/locale'
import { loadUiStrings } from '@/lib/cms/ui-strings'
import { UIStringsProvider } from '@/components/providers/UIStringsProvider'
import CollectorForm from './CollectorForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

interface PageProps {
  params: Promise<{ token: string }>
}

interface CoupleSummary {
  userId: string
  coupleName: string
  weddingDate: string | null
  city: string | null
  venue: string | null
  startsAt: string | null
  dressCode: string | null
  rsvpContact: string | null
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
    .select('partner1_name, partner2_name, wedding_date, city, whatsapp_phone, collector_page')
    .eq('user_id', owner.id)
    .maybeSingle<{
      partner1_name: string | null
      partner2_name: string | null
      wedding_date: string | null
      city: string | null
      whatsapp_phone: string | null
      collector_page: PledgePageConfig | null
    }>()
  if (profileErr) {
    console.error('[collect] couple profile load failed', profileErr)
    throw profileErr
  }

  const { data: primaryEvent } = await supabase
    .from('wedding_events')
    .select('name, venue_name, city, starts_at, dress_code')
    .eq('user_id', owner.id)
    .order('sort_order', { ascending: true })
    .order('starts_at', { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle<{
      name: string | null
      venue_name: string | null
      city: string | null
      starts_at: string | null
      dress_code: string | null
    }>()

  const names = [profile?.partner1_name, profile?.partner2_name].filter(Boolean)
  const coupleName = names.length ? names.join(' & ') : primaryEvent?.name?.trim() || 'The Couple'
  const venue = [primaryEvent?.venue_name, primaryEvent?.city ?? profile?.city].filter(Boolean).join(', ') || null

  return {
    userId: owner.id,
    coupleName,
    weddingDate: profile?.wedding_date ?? primaryEvent?.starts_at ?? null,
    city: profile?.city ?? primaryEvent?.city ?? null,
    venue,
    startsAt: primaryEvent?.starts_at ?? null,
    dressCode: primaryEvent?.dress_code ?? null,
    rsvpContact: profile?.whatsapp_phone ?? null,
    config: profile?.collector_page ?? {},
  }
}

export default async function CollectorPage({ params }: PageProps) {
  const { token } = await params
  const couple = await loadCouple(token)
  if (!couple) notFound()
  const locale = await getLocale()
  const formsCollect = await loadUiStrings('forms-collect', locale)
  return (
    <UIStringsProvider bundles={{ 'forms-collect': formsCollect }}>
      <CollectorForm
        token={token}
        coupleName={couple.coupleName}
        weddingDate={couple.weddingDate}
        city={couple.city}
        venue={couple.venue}
        startsAt={couple.startsAt}
        dressCode={couple.dressCode}
        rsvpContact={couple.rsvpContact}
        config={couple.config}
        locale={locale}
      />
    </UIStringsProvider>
  )
}
