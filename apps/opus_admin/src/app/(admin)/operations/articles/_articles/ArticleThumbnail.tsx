// OF-ADM-EDITORIAL-001 — image-or-category-block thumbnail. Uses a plain
// <img> tag rather than next/image because the rest of the admin app does
// the same — every Supabase Storage host would otherwise need to be
// allowlisted in next.config.js, and the layout-shift cost is negligible
// for a 64×44 thumbnail.

import { resolveMediaUrl } from '@/app/(admin)/cms/advice-and-ideas/_media'
import CategoryBadge from '../../_shared/CategoryBadge'

type Props = {
  category: string | null | undefined
  heroSrc: string | null | undefined
  heroAlt?: string | null
  // hero_media_type can be 'video' — we don't render those inline; fall
  // through to the category block instead.
  heroType: 'image' | 'video' | null | undefined
  className?: string
}

export default function ArticleThumbnail({
  category,
  heroSrc,
  heroAlt,
  heroType,
  className,
}: Props) {
  const showImage = !!heroSrc && heroType === 'image'

  if (showImage) {
    return (
      <span
        className={`relative block h-[44px] w-[64px] overflow-hidden rounded-md bg-gray-100 ${className ?? ''}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={resolveMediaUrl(heroSrc)}
          alt={heroAlt ?? ''}
          className="h-full w-full object-cover"
        />
      </span>
    )
  }

  return <CategoryBadge category={category} className={className} />
}
