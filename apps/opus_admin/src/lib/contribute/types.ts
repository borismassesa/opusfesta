import type { AdviceIdeasBodySection } from '@/lib/cms/advice-ideas'

export const CONTRIBUTOR_CATEGORIES = [
  'Advice & Ideas',
  'Real Weddings',
  'Planning Guides',
  'Style',
  'Vendors',
  'Etiquette',
] as const

export type ContributorCategory = (typeof CONTRIBUTOR_CATEGORIES)[number]

export const EDITABLE_CONTRIBUTOR_STATUSES = ['draft', 'revisions', 'changes_requested'] as const
export const LOCKED_CONTRIBUTOR_STATUSES = ['pending', 'submitted', 'approved', 'rejected', 'published'] as const

export type ContributorSubmissionStatus =
  | 'draft'
  | 'pending'
  | 'submitted'
  | 'revisions'
  | 'changes_requested'
  | 'approved'
  | 'rejected'
  | 'published'

export type ContributorDraft = {
  id: string
  author_email: string
  author_clerk_id: string | null
  status: ContributorSubmissionStatus
  title: string
  summary: string
  category: string
  cover_image_url: string
  cover_image_alt: string
  body: AdviceIdeasBodySection[]
  word_count: number
  submitted_at: string | null
  reviewed_at: string | null
  review_notes: string | null
  source_post_id: string | null
  slug: string
  created_at: string
  updated_at: string
}

export function isEditableContributorStatus(status: string): boolean {
  return EDITABLE_CONTRIBUTOR_STATUSES.includes(
    status as (typeof EDITABLE_CONTRIBUTOR_STATUSES)[number]
  )
}

export function displayStatus(status: string): ContributorSubmissionStatus {
  if (status === 'submitted') return 'pending'
  if (status === 'changes_requested') return 'revisions'
  return status as ContributorSubmissionStatus
}
