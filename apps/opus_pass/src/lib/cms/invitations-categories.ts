import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { INVITATION_CATEGORIES, type InvitationCategory } from '@/data/invitations-categories'

/** CMS-shape category — uses snake_case to match the JSONB storage convention. */
export type InvitationCategoryCms = {
  slug: string
  label: string
  img: string
  alt: string
  subtitle: string
  product_matchers: string[]
}

export type InvitationsCategoriesContent = {
  heading: string
  description: string
  categories: InvitationCategoryCms[]
}

const HARDCODED_CMS_CATEGORIES: InvitationCategoryCms[] = INVITATION_CATEGORIES.map((c) => ({
  slug: c.slug,
  label: c.label,
  img: c.img,
  alt: c.alt,
  subtitle: c.subtitle,
  product_matchers: c.productMatchers,
}))

export const INVITATIONS_CATEGORIES_FALLBACK: InvitationsCategoriesContent = {
  heading: 'Invitations for Every Moment',
  description:
    'Pick one design once, and every card across your day matches your suite. No mixing fonts, no clashing palettes, no last-minute hunt for matching paper.',
  categories: HARDCODED_CMS_CATEGORIES,
}

/** Convert a CMS-shape category to the runtime shape used by /invitations/[category]. */
export function cmsCategoryToRuntime(c: InvitationCategoryCms): InvitationCategory {
  return {
    slug: c.slug,
    label: c.label,
    img: c.img,
    alt: c.alt,
    subtitle: c.subtitle,
    productMatchers: c.product_matchers,
  }
}

export async function loadInvitationsCategoriesContent(): Promise<InvitationsCategoriesContent> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return INVITATIONS_CATEGORIES_FALLBACK
  }
  try {
    let isDraft = false
    try {
      const draft = await draftMode()
      isDraft = draft.isEnabled
    } catch {
      // called outside a request scope (e.g. generateStaticParams) — treat as non-draft
    }
    const supabase = createSupabaseServerClient()
    const { data } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', 'opus-pass-invitations')
      .eq('section_key', 'categories')
      .maybeSingle()
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | Partial<InvitationsCategoriesContent>
      | undefined
    if (stored) {
      return {
        heading: stored.heading ?? INVITATIONS_CATEGORIES_FALLBACK.heading,
        description: stored.description ?? INVITATIONS_CATEGORIES_FALLBACK.description,
        categories:
          stored.categories && Array.isArray(stored.categories) && stored.categories.length > 0
            ? stored.categories
            : INVITATIONS_CATEGORIES_FALLBACK.categories,
      }
    }
    return INVITATIONS_CATEGORIES_FALLBACK
  } catch (err) {
    console.error('[opus-pass cms] invitations-categories load failed', err)
    return INVITATIONS_CATEGORIES_FALLBACK
  }
}

/**
 * Server-side build helper: used by /invitations/[category]/generateStaticParams
 * and the [category] page lookup. Tries the CMS and falls back to the hardcoded
 * list if Supabase env vars are missing or the row doesn't exist yet.
 */
export async function loadInvitationCategoriesList(): Promise<InvitationCategory[]> {
  const { categories } = await loadInvitationsCategoriesContent()
  return categories.map(cmsCategoryToRuntime)
}
