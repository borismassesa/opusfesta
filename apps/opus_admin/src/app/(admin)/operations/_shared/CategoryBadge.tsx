// OF-ADM-EDITORIAL-001 — colored thumbnail block used as the cover-image
// fallback on the Articles list. The category code lives bottom-left of the
// block in the darker stop of the same color ramp, so the block is both a
// visual scan aid and a label.
//
// `categoryFor()` resolves the existing free-text category strings on
// advice_ideas_posts (e.g. "Planning Guides", "Real Weddings") down to the
// six canonical OpusFesta editorial categories. New / unknown categories
// fall back to the lavender brand tint.

import { cn } from '@/lib/utils'

export type CategoryKey =
  | 'advice'
  | 'real'
  | 'planning'
  | 'style'
  | 'vendors'
  | 'etiquette'

type CategoryStyle = {
  bg: string
  text: string
  code: string
  label: string
}

const CATEGORIES: Record<CategoryKey, CategoryStyle> = {
  advice: { bg: 'bg-[#F0DFF6]', text: 'text-[#2A1B3D]', code: 'A&I', label: 'Advice & Ideas' },
  real: { bg: 'bg-[#FCE4DE]', text: 'text-[#4A1B0C]', code: 'REAL', label: 'Real Weddings' },
  planning: { bg: 'bg-[#DCEAFC]', text: 'text-[#042C53]', code: 'PLAN', label: 'Planning' },
  style: { bg: 'bg-[#FCDCEA]', text: 'text-[#4B1528]', code: 'STYLE', label: 'Style' },
  vendors: { bg: 'bg-[#F4E9D2]', text: 'text-[#412402]', code: 'VEND', label: 'Vendors' },
  etiquette: { bg: 'bg-[#D7F0E5]', text: 'text-[#04342C]', code: 'ETIQ', label: 'Etiquette' },
}

// Loose mapping from existing free-text categories / section ids to the
// canonical category key. Anything not matched falls back to 'advice' so
// orphan rows stay visually consistent rather than blowing up.
export function categoryFor(input: string | null | undefined): CategoryKey {
  const v = (input ?? '').toLowerCase().trim()
  if (!v) return 'advice'
  if (v.includes('real') || v.includes('wedding')) return 'real'
  if (v.includes('planning') || v.includes('guide')) return 'planning'
  if (v.includes('style') || v.includes('theme')) return 'style'
  if (v.includes('vendor')) return 'vendors'
  if (v.includes('etiquette') || v.includes('wording')) return 'etiquette'
  return 'advice'
}

export function categoryLabel(input: string | null | undefined): string {
  const key = categoryFor(input)
  return CATEGORIES[key].label
}

export default function CategoryBadge({
  category,
  className,
}: {
  // Either an explicit key or the free-text category string from Supabase.
  category: CategoryKey | string | null | undefined
  className?: string
}) {
  const key: CategoryKey =
    typeof category === 'string' && category in CATEGORIES
      ? (category as CategoryKey)
      : categoryFor(typeof category === 'string' ? category : '')
  const style = CATEGORIES[key]
  return (
    <span
      className={cn(
        'relative inline-flex h-[44px] w-[64px] shrink-0 overflow-hidden rounded-md',
        style.bg,
        className
      )}
      aria-hidden="true"
    >
      <span
        className={cn(
          'absolute bottom-1 left-1.5 text-[9px] font-bold uppercase tracking-wider',
          style.text
        )}
      >
        {style.code}
      </span>
    </span>
  )
}
