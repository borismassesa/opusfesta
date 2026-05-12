'use client'

import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'
import type { ReadinessItem } from '@/lib/contribute/validateReadiness'
import type { ContributorSubmissionStatus } from '@/lib/contribute/types'
import SectionsCard from '@/components/article-sections/SectionsCard'
import Link from 'next/link'
import CategoryCard from './CategoryCard'
import CoverImageCard from './CoverImageCard'
import ReadinessCard from './ReadinessCard'
import DiscardLink from './DiscardLink'
import LockedNotice from './LockedNotice'

export default function RightRail({
  draftId,
  draftTitle,
  category,
  body,
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
  authorName,
  authorRole,
  authorAvatarUrl,
  authorBio,
  authorInitials,
}: {
  draftId: string
  draftTitle: string
  category: string
  body: AdviceIdeasBodySection[]
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
  authorName: string
  authorRole: string
  authorAvatarUrl: string
  authorBio: string
  authorInitials: string
}) {
  return (
    <aside className="space-y-7">
      <AuthorProfileCard
        name={authorName}
        role={authorRole}
        avatarUrl={authorAvatarUrl}
        bio={authorBio}
        initials={authorInitials}
      />
      <SectionsCard body={body} />
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

function AuthorProfileCard({
  name,
  role,
  avatarUrl,
  bio,
  initials,
}: {
  name: string
  role: string
  avatarUrl: string
  bio: string
  initials: string
}) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-3.5">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span>{initials || 'AU'}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.04em] text-gray-500">
            Author profile
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-gray-950">
            {name || 'Set your byline'}
          </p>
          {role && <p className="truncate text-xs text-gray-500">{role}</p>}
        </div>
      </div>
      {bio ? (
        <p className="mt-3 line-clamp-4 text-xs leading-relaxed text-gray-600">
          {bio}
        </p>
      ) : (
        <p className="mt-3 text-xs leading-relaxed text-amber-700">
          Add a short bio so readers see who wrote the article.
        </p>
      )}
      <Link
        href="/contribute/profile"
        className="mt-3 inline-flex text-xs font-semibold text-[#5B2D8E] hover:underline"
      >
        {bio ? 'Edit bio and avatar' : 'Write bio'}
      </Link>
    </section>
  )
}
