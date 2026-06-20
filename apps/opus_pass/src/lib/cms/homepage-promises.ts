import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'

export type PromiseIconKey = 'sparkles' | 'palette' | 'wand2' | 'message-circle' | 'heart' | 'shield-check' | 'star' | 'gem'

export type HomepagePromiseItem = {
  id: string
  icon: PromiseIconKey
  title: string
  description: string
}

export type HomepagePromisesContent = {
  items: HomepagePromiseItem[]
}

export const HOMEPAGE_PROMISES_FALLBACK: HomepagePromisesContent = {
  items: [
    {
      id: 'premium-quality',
      icon: 'sparkles',
      title: 'Premium quality',
      description: 'The finest and most premium materials & printing techniques.',
    },
    {
      id: 'designed-by-artists',
      icon: 'palette',
      title: 'Designed by artists',
      description: 'Every purchase supports our independent artist community.',
    },
    {
      id: 'easy-customization',
      icon: 'wand2',
      title: 'Easy customization',
      description: 'Make it personal by tailoring card shape, colors, fonts, paper type, & more.',
    },
    {
      id: 'free-support',
      icon: 'message-circle',
      title: 'Free support',
      description: 'Bring your vision to life with the helping hand of a wedding concierge.',
    },
  ],
}

// Stored shape: per-item title/description may be a localized { en, sw } object
// or a legacy plain string; id/icon are scalar. The loader resolves each
// translatable field for `locale` and returns the flat HomepagePromisesContent
// the render component already expects.
type StoredPromiseItem = {
  id?: string
  icon?: PromiseIconKey
  title?: MaybeLocalized
  description?: MaybeLocalized
}
type StoredHomepagePromises = {
  items?: StoredPromiseItem[]
}

export async function loadHomepagePromisesContent(
  locale: Locale = DEFAULT_LOCALE
): Promise<HomepagePromisesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return HOMEPAGE_PROMISES_FALLBACK
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-homepage')
      .eq('section_key', 'promises')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredHomepagePromises
      | undefined
    if (stored?.items && Array.isArray(stored.items) && stored.items.length > 0) {
      return {
        items: stored.items.map((item, i) => ({
          id: item.id ?? `promise-${i}`,
          icon: item.icon ?? 'sparkles',
          title: resolveLocalized(item.title, locale),
          description: resolveLocalized(item.description, locale),
        })),
      }
    }
    return HOMEPAGE_PROMISES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] homepage-promises load failed', err)
    return HOMEPAGE_PROMISES_FALLBACK
  }
}
