import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'
import {
  UI_STRINGS_FALLBACKS,
  UI_STRINGS_PAGE_KEY,
  type UiArea,
  type UiStringsByArea,
} from './ui-strings-fallback'

// Public read side for the editable, bilingual microcopy on the OpusPass site
// chrome (navbar + footer). One CMS row per area (page_key from
// UI_STRINGS_PAGE_KEY, section_key 'copy'). The shape mirrors
// ./dashboard-copy.ts exactly.
//
// Admin write side + field schema:
//   apps/opus_admin/src/lib/cms/opus-pass-ui-strings.ts
// Editor:
//   apps/opus_admin/src/app/(admin)/cms/opus-pass/site-ui/[area]/
//
// BOUNDARY RULE: this file imports next/headers, so client components must
// import the *types* + fallbacks from ./ui-strings-fallback (a pure module),
// never from here. Server components may call loadUiStrings() directly.

export {
  UI_STRINGS_FALLBACKS,
  UI_STRINGS_PAGE_KEY,
  type UiArea,
  type NavbarStrings,
  type FooterStrings,
  type UiStringsByArea,
} from './ui-strings-fallback'

const SECTION_KEY = 'copy'

// Stored shape: every field is translatable, so a stored value may be a
// localized { en, sw } object OR a legacy plain string. Each key is resolved for
// `locale`; the RETURNED record stays flat strings (consumers are unchanged).
type StoredUiStrings = Record<string, MaybeLocalized>

export async function loadUiStrings<A extends UiArea>(
  area: A,
  locale: Locale = DEFAULT_LOCALE,
): Promise<UiStringsByArea[A]> {
  const fallback = UI_STRINGS_FALLBACKS[area] as UiStringsByArea[A]
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallback
  }
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', UI_STRINGS_PAGE_KEY[area])
      .eq('section_key', SECTION_KEY)
      .maybeSingle()
    if (error) {
      console.error(`[opus-pass cms] ui-strings (${area}) query failed`, error)
      return fallback
    }
    const stored = (isDraft ? data?.draft_content ?? data?.content : data?.content) as
      | StoredUiStrings
      | undefined
    if (stored) {
      // Resolve PER FIELD rather than spreading `{ ...fallback, ...stored }` —
      // a blind spread would leak stored LocalizedText objects into the string
      // consumers. Iterate the fallback's keys (the canonical field set) and for
      // each key resolve the stored value (or the fallback) for `locale`.
      const resolved: Record<string, string> = {}
      for (const key of Object.keys(fallback) as (keyof UiStringsByArea[A])[]) {
        const k = key as string
        resolved[k] = resolveLocalized(
          stored[k] ?? (fallback[key] as MaybeLocalized),
          locale,
        )
      }
      return resolved as unknown as UiStringsByArea[A]
    }
    return fallback
  } catch (err) {
    console.error(`[opus-pass cms] ui-strings (${area}) load failed`, err)
    return fallback
  }
}
