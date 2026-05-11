'use client'

import {
  ADVICE_IDEAS_CATEGORY_GROUPS,
  ADVICE_IDEAS_CATEGORIES,
  getCategorySection,
} from '@/lib/cms/advice-ideas'

export default function CategoryCard({
  value,
  onChange,
  readOnly,
}: {
  value: string
  onChange: (value: string) => void
  readOnly: boolean
}) {
  const section = getCategorySection(value)
  // If the saved value isn't in the canonical list (legacy categories like
  // "Style" / "Vendors" / "Advice & Ideas"), keep it selectable so the draft
  // doesn't silently lose its category, but flag the mismatch in the hint.
  const isLegacy = !!value && !ADVICE_IDEAS_CATEGORIES.includes(value)

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">
        Category
      </p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={readOnly}
        className="mt-4 h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base font-semibold text-gray-950 outline-none transition-colors focus:border-[#5B2D8E] disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        <option value="" disabled>
          Choose a category…
        </option>
        {isLegacy && (
          <option value={value}>{value} (legacy)</option>
        )}
        {ADVICE_IDEAS_CATEGORY_GROUPS.map((group) => (
          <optgroup key={group.section} label={group.section}>
            {group.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      <p className="mt-3 text-[11px] leading-5 text-gray-500">
        {section ? (
          <>
            Goes under{' '}
            <span className="font-semibold text-gray-700">{section}</span> on
            the live site.
          </>
        ) : (
          <>
            Pick a category — it routes your article to either{' '}
            <span className="font-semibold text-gray-700">Inspiration</span> or{' '}
            <span className="font-semibold text-gray-700">Advice</span> on the
            live site.
          </>
        )}
      </p>
    </section>
  )
}
