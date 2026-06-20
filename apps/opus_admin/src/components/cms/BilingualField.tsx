'use client'

import { cn } from '@/lib/utils'
import {
  LOCALES,
  LOCALE_LABELS,
  toLocalized,
  type LocalizedText,
  type MaybeLocalized,
} from '@/lib/cms/localized'

const inputCls =
  'w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C9A0DC] focus:border-transparent transition-all'

const LOCALE_TAG: Record<(typeof LOCALES)[number], string> = {
  en: 'EN',
  sw: 'SW',
}

function CharCount({ value, max }: { value: string; max: number }) {
  const len = (value ?? '').length
  const over = len > max
  const near = !over && len > max * 0.85
  return (
    <span
      className={cn(
        'tabular-nums font-medium',
        over ? 'text-red-500' : near ? 'text-amber-600' : 'text-gray-400'
      )}
    >
      {len}/{max}
    </span>
  )
}

type Props = {
  label: string
  value: MaybeLocalized
  onChange: (next: LocalizedText) => void
  placeholder?: string
  /** Per-locale character-count hint. Omit to hide. */
  max?: number
  /** Render textareas instead of single-line inputs. */
  multiline?: boolean
  rows?: number
}

// A translatable text field rendered as stacked English + Kiswahili inputs.
// Reads/writes a `LocalizedText` ({ en, sw }), normalizing any legacy plain
// string on the way in (so existing content shows up under English). Always
// emits a fixed key order so the editor's JSON.stringify dirty-check is stable.
//
// Replaces the single `<input>` / `<textarea>` for any translatable field in
// the OpusPass CMS editors.
export function BilingualField({
  label,
  value,
  onChange,
  placeholder,
  max,
  multiline = false,
  rows = 3,
}: Props) {
  const current = toLocalized(value)

  const update = (locale: 'en' | 'sw', text: string) =>
    onChange(
      locale === 'en'
        ? { en: text, sw: current.sw }
        : { en: current.en, sw: text }
    )

  return (
    <div className="block">
      <div className="mb-1.5 text-xs font-semibold text-gray-600">{label}</div>
      <div className="space-y-2">
        {LOCALES.map((locale) => {
          const text = current[locale]
          return (
            <div key={locale}>
              <div className="mb-1 flex items-baseline justify-between">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-500">
                    {LOCALE_TAG[locale]}
                  </span>
                  {LOCALE_LABELS[locale]}
                </span>
                {max != null && <CharCount value={text} max={max} />}
              </div>
              {multiline ? (
                <textarea
                  rows={rows}
                  value={text}
                  onChange={(e) => update(locale, e.target.value)}
                  placeholder={locale === 'sw' ? undefined : placeholder}
                  className={inputCls}
                />
              ) : (
                <input
                  type="text"
                  value={text}
                  onChange={(e) => update(locale, e.target.value)}
                  placeholder={locale === 'sw' ? undefined : placeholder}
                  className={inputCls}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
