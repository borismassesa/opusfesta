import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

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

// Stored shape: the eyebrow + body copy are translatable (a localized
// { en, sw } object or a legacy plain string); the promo code and background
// colour are scalar. The loader resolves the translatable fields for `locale`
// and returns the flat InvitationsPromoBannerContent the render path expects.
type StoredPromoBannerContent = {
  eyebrow?: MaybeLocalized
  body?: MaybeLocalized
  promo_code?: string
  background_color?: string
}

export async function loadInvitationsPromoBannerContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<InvitationsPromoBannerContent> {
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
      | StoredPromoBannerContent
      | undefined
    if (stored) {
      const F = INVITATIONS_PROMO_BANNER_FALLBACK
      return {
        eyebrow: resolveLocalized(stored.eyebrow ?? F.eyebrow, locale),
        body: resolveLocalized(stored.body ?? F.body, locale),
        promo_code: stored.promo_code ?? F.promo_code,
        background_color: stored.background_color ?? F.background_color,
      }
    }
    return INVITATIONS_PROMO_BANNER_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-promo-banner load failed', err)
    return INVITATIONS_PROMO_BANNER_FALLBACK
  }
}
