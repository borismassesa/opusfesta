import { translations } from '@/lib/i18n'
import type { Lang, MergedTranslations } from '@/lib/i18n'

export type { MergedTranslations }

export type ContentOverrides = {
  en: Partial<typeof translations.en>
  sw: Partial<typeof translations.sw>
}

function deepMerge<T extends Record<string, unknown>>(base: T, override: Partial<T>): T {
  const result = { ...base }
  for (const key in override) {
    const ov = override[key]
    const bv = base[key]
    if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
      result[key] = deepMerge(bv as Record<string, unknown>, ov as Record<string, unknown>) as T[typeof key]
    } else if (ov !== undefined) {
      result[key] = ov as T[typeof key]
    }
  }
  return result
}

export function mergeTranslations(overrides: ContentOverrides): MergedTranslations {
  return {
    en: deepMerge(translations.en as unknown as Record<string, unknown>, overrides.en as Record<string, unknown>) as typeof translations.en,
    sw: deepMerge(translations.sw as unknown as Record<string, unknown>, overrides.sw as Record<string, unknown>) as typeof translations.sw,
  } as MergedTranslations
}

export async function fetchPublishedContent(): Promise<ContentOverrides> {
  try {
    const { getSupabaseAdmin } = await import('./supabase-admin')
    const db = getSupabaseAdmin()
    const { data } = await db
      .from('opus_info_content')
      .select('lang, section_key, content')

    const overrides: ContentOverrides = { en: {}, sw: {} }
    for (const row of data ?? []) {
      const lang = row.lang as Lang
      if (lang === 'en' || lang === 'sw') {
        ;(overrides[lang] as Record<string, unknown>)[row.section_key] = row.content
      }
    }
    return overrides
  } catch {
    return { en: {}, sw: {} }
  }
}

export const SECTION_KEYS = ['hero', 'problem', 'platform', 'whoWeServe', 'quote', 'opportunity', 'cta'] as const
export type SectionKey = typeof SECTION_KEYS[number]
