import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'

export type InvitationsPromoBannerContent = {
  eyebrow: string
  body: string
  promo_code: string
  background_color: string
}

export const INVITATIONS_PROMO_BANNER_FALLBACK: InvitationsPromoBannerContent = {
  eyebrow: '40% off',
  body: 'wedding paper with code',
  promo_code: 'KARIBU40',
  background_color: '#FCE9C2',
}

export async function loadInvitationsPromoBannerContent(): Promise<InvitationsPromoBannerContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_PROMO_BANNER_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'promo-banner')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsPromoBannerContent>
      | undefined
    if (stored) {
      return { ...INVITATIONS_PROMO_BANNER_FALLBACK, ...stored }
    }
    return INVITATIONS_PROMO_BANNER_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-promo-banner load failed', err)
    return INVITATIONS_PROMO_BANNER_FALLBACK
  }
}
