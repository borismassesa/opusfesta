import { createSupabaseAdminClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'
import {
  PORTAL_UI_PAGE_KEY,
  PORTAL_UI_STRINGS_FALLBACKS,
  type PortalUiArea,
  type PortalUiStringsByArea,
} from './portal-ui-fallback'

// Public read side for the editable, bilingual microcopy on the vendors_portal
// operational portal (chrome, /verify, and later areas). One CMS row per area
// (page_key from PORTAL_UI_PAGE_KEY, section_key 'copy'). Mirrors
// apps/opus_pass/src/lib/cms/ui-strings.ts exactly.
//
// Admin write side + field schema:
//   apps/opus_admin/src/lib/cms/vendors-portal-ui-strings.ts
// Editor:
//   apps/opus_admin/src/app/(admin)/cms/vendors-portal/site-ui/[area]/
//
// BOUNDARY RULE: this file is server-only (reads via the service-role admin
// client), so client components must import the *types* + fallbacks from
// ./portal-ui-fallback (a pure module), never from here. Server components
// may call loadPortalUiStrings() directly.
//
// Unlike opus_pass, vendors_portal's root layout is already
// `export const dynamic = 'force-dynamic'` app-wide, so every request already
// re-reads fresh — no per-route dynamic export or draftMode() preview check
// is needed here (there is no separate "preview" mode in this admin flow;
// Save draft / Publish / Discard round-trip through website_page_sections
// directly, matching how the vendors-portal marketing CMS editors work).

const SECTION_KEY = 'copy'

// Stored shape: every field is translatable, so a stored value may be a
// localized { en, sw } object OR a legacy plain string.
type StoredPortalUiStrings = Record<string, MaybeLocalized>

export async function loadPortalUiStrings<A extends PortalUiArea>(
  area: A,
  locale: Locale = DEFAULT_LOCALE,
): Promise<PortalUiStringsByArea[A]> {
  const fallback = PORTAL_UI_STRINGS_FALLBACKS[area] as PortalUiStringsByArea[A]
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return fallback
  }
  try {
    const supabase = createSupabaseAdminClient()
    const { data, error } = await supabase
      .from('website_page_sections')
      .select('content, draft_content')
      .eq('page_key', PORTAL_UI_PAGE_KEY[area])
      .eq('section_key', SECTION_KEY)
      .maybeSingle()
    if (error) {
      console.error(`[vendors-portal cms] portal-ui (${area}) query failed`, error)
      return fallback
    }
    const stored = data?.content as StoredPortalUiStrings | undefined
    if (stored) {
      // Resolve PER FIELD rather than spreading `{ ...fallback, ...stored }` —
      // a blind spread would leak stored LocalizedText objects into the
      // string consumers. Iterate the fallback's keys (the canonical field
      // set) and for each key resolve the stored value (or the fallback) for
      // `locale`.
      const resolved: Record<string, string> = {}
      for (const key of Object.keys(fallback) as (keyof PortalUiStringsByArea[A])[]) {
        const k = key as string
        resolved[k] = resolveLocalized(
          stored[k] ?? (fallback[key] as MaybeLocalized),
          locale,
        )
      }
      return resolved as unknown as PortalUiStringsByArea[A]
    }
    return fallback
  } catch (err) {
    console.error(`[vendors-portal cms] portal-ui (${area}) load failed`, err)
    return fallback
  }
}
