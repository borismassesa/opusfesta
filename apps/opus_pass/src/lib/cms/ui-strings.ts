import { draftMode } from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase'
import { DEFAULT_LOCALE, resolveLocalized, type Locale, type MaybeLocalized } from './localized'
import {
  NAVBAR_SOURCES,
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
  type HelpStrings,
  type PricingStrings,
  type HowItWorksStrings,
  type CartStrings,
  type AddressStrings,
  type ConfirmationStrings,
  type CheckoutFormStrings,
  type CheckoutPaymentStrings,
  type CheckoutSummaryStrings,
  type FormsCollectStrings,
  type FormsRsvpStrings,
  type FormsPledgeStrings,
  type DashboardChromeStrings,
  type DashboardOrdersStrings,
  type DashboardEventsStrings,
  type DashboardSeatingStrings,
  type DashboardSendStrings,
  type DashboardEventScopeStrings,
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
  // The navbar's keys are authored across four CMS rows (each product's own
  // mega-menu + the shared chrome). Merge them into one map before resolving.
  if (area === 'navbar') {
    return loadMergedNavbarStrings(locale) as Promise<UiStringsByArea[A]>
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

// Merge the four NAVBAR_SOURCES rows into one flat NavbarStrings map. Each row
// stores only its own subset of keys; we Object.assign all of them, then resolve
// over the canonical fallback key set so any missing key falls back to English.
async function loadMergedNavbarStrings(locale: Locale): Promise<UiStringsByArea['navbar']> {
  const fallback = UI_STRINGS_FALLBACKS.navbar
  try {
    const { isEnabled: isDraft } = await draftMode()
    const supabase = createSupabaseServerClient()
    const pageKeys = Array.from(new Set(NAVBAR_SOURCES.map((s) => s.pageKey)))
    const { data, error } = await supabase
      .from('website_page_sections')
      .select('page_key, section_key, content, draft_content')
      .in('page_key', pageKeys)
    if (error) {
      console.error('[opus-pass cms] ui-strings (navbar) query failed', error)
      return fallback
    }
    const rows = (data ?? []) as Array<{
      page_key: string
      section_key: string
      content: StoredUiStrings | null
      draft_content: StoredUiStrings | null
    }>
    // Overlay each configured source's stored map in NAVBAR_SOURCES order.
    const merged: StoredUiStrings = {}
    for (const source of NAVBAR_SOURCES) {
      const row = rows.find(
        (r) => r.page_key === source.pageKey && r.section_key === source.sectionKey,
      )
      if (!row) continue
      const stored = isDraft ? row.draft_content ?? row.content : row.content
      if (stored) Object.assign(merged, stored)
    }
    // Resolve over the canonical fallback key set (flat strings out).
    const resolved: Record<string, string> = {}
    for (const key of Object.keys(fallback) as (keyof UiStringsByArea['navbar'])[]) {
      const k = key as string
      resolved[k] = resolveLocalized(
        merged[k] ?? (fallback[key] as MaybeLocalized),
        locale,
      )
    }
    return resolved as unknown as UiStringsByArea['navbar']
  } catch (err) {
    console.error('[opus-pass cms] ui-strings (navbar) load failed', err)
    return fallback
  }
}
