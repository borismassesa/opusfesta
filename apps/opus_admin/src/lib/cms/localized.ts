// Bilingual (English + Swahili) text primitive shared by the OpusPass CMS.
//
// Mirrored from apps/opus_pass/src/lib/cms/localized.ts — the two apps duplicate
// CMS types by convention (different path aliases, no shared package). This
// module is PURE (no server-only imports) so admin client editors can import
// the values, not just the types.
//
// A translatable field is stored either as a legacy plain `string` (English) or
// as a `LocalizedText` object. The resolver tolerates both, so existing content
// keeps rendering with NO data migration.

export type Locale = 'en' | 'sw'

export const LOCALES: Locale[] = ['en', 'sw']
export const DEFAULT_LOCALE: Locale = 'en'

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
}

export type LocalizedText = { en: string; sw: string }

// A translatable field as stored: new `{ en, sw }` object OR a legacy string.
export type MaybeLocalized = string | LocalizedText | null | undefined

export function isLocalizedText(value: unknown): value is LocalizedText {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    'en' in value
  )
}

// The single read-path for translatable text. Empty Swahili falls back to
// English so the public site never renders a blank.
export function resolveLocalized(value: MaybeLocalized, locale: Locale): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  return value[locale] || value.en || ''
}

// Editor-side: lift any stored value into the `{ en, sw }` object shape with a
// FIXED key order (en before sw) — editors detect "dirty" via JSON.stringify,
// so unstable key order would cause false-positive dirty flags.
export function toLocalized(value: MaybeLocalized): LocalizedText {
  if (value == null) return { en: '', sw: '' }
  if (typeof value === 'string') return { en: value, sw: '' }
  return { en: value.en ?? '', sw: value.sw ?? '' }
}

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'sw'
}
