'use client'

import type { ReadinessItem } from '@/lib/contribute/validateReadiness'
import type { ContributorSubmissionStatus } from '@/lib/contribute/types'
import CategoryCard from './CategoryCard'
import CoverImageCard from './CoverImageCard'
import ReadinessCard from './ReadinessCard'
import DiscardLink from './DiscardLink'
import LockedNotice from './LockedNotice'

export default function RightRail({
  draftId,
  draftTitle,
  category,
  coverUrl,
  coverAlt,
  readOnly,
  status,
  notes,
  readinessItems,
  missingCount,
  shaking,
  onCategoryChange,
  onCoverChange,
}: {
  draftId: string
  draftTitle: string
  category: string
  coverUrl: string
  coverAlt: string
  readOnly: boolean
  status: ContributorSubmissionStatus
  notes: string | null
  readinessItems: ReadinessItem[]
  missingCount: number
  shaking: boolean
  onCategoryChange: (value: string) => void
  onCoverChange: (next: { cover_image_url?: string; cover_image_alt?: string }) => void
}) {
  return (
    <aside className="space-y-7">
      <CategoryCard value={category} onChange={onCategoryChange} readOnly={readOnly} />
      <CoverImageCard
        draftId={draftId}
        url={coverUrl}
        alt={coverAlt}
        readOnly={readOnly}
        onChange={onCoverChange}
      />
      {readOnly ? (
        <LockedNotice status={status} notes={notes} />
      ) : (
        <>
          <ReadinessCard items={readinessItems} missingCount={missingCount} shaking={shaking} />
          <DiscardLink draftId={draftId} draftTitle={draftTitle} />
        </>
      )}
    </aside>
  )
}
