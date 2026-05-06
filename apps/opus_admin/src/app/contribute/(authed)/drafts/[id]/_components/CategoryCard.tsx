'use client'

import { CONTRIBUTOR_CATEGORIES } from '@/lib/contribute/types'

export default function CategoryCard({
  value,
  onChange,
  readOnly,
}: {
  value: string
  onChange: (value: string) => void
  readOnly: boolean
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">Category</p>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={readOnly}
        className="mt-4 h-12 w-full rounded-lg border border-gray-200 bg-white px-3 text-base font-semibold text-gray-950 outline-none transition-colors focus:border-[#5B2D8E] disabled:cursor-not-allowed disabled:bg-gray-50"
      >
        {CONTRIBUTOR_CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <p className="mt-3 text-[11px] leading-5 text-gray-500">Routes your draft to the right editor</p>
    </section>
  )
}
