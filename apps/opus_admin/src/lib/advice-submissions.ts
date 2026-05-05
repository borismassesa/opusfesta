import {
  type AdviceIdeasBodySection,
  type AdviceIdeasSectionId,
  type AdviceIdeasSeedComment,
  type PostDraft,
} from '@/lib/cms/advice-ideas'

// PostgREST returns PGRST205 when a referenced table is missing from the
// schema cache — usually because the contributor workflow migration hasn't
// been applied yet, or the cache is stale. Routes that read these tables
// degrade to an empty state and log a hint instead of crashing the page.
export const ADVICE_SUBMISSION_MISSING_TABLE_HINT =
  "advice_article_invitations / advice_article_submissions not in schema cache. Apply migration 20260505000001_advice_article_contributor_workflow.sql or run NOTIFY pgrst, 'reload schema'. Falling back to empty state."

export function isMissingAdviceSubmissionTable(
  error: { code?: string | null } | null | undefined
): boolean {
  return error?.code === 'PGRST205'
}

export const SUBMISSION_STATUSES = [
  'draft',
  'submitted',
  'changes_requested',
  'approved',
  'rejected',
  'published',
] as const

export type AdviceSubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export type AdviceArticleInvitationRow = {
  id: string
  email: string
  full_name: string | null
  article_title: string | null
  status: 'pending' | 'accepted' | 'revoked' | 'expired'
  expires_at: string
  accepted_at: string | null
  accepted_submission_id: string | null
  created_at: string
  updated_at: string
}

export type AdviceArticleSubmissionRow = {
  id: string
  invitation_id: string | null
  author_email: string
  author_clerk_id: string | null
  status: AdviceSubmissionStatus
  admin_notes: string | null
  correction_notes: string | null
  source_post_id: string | null
  slug: string
  title: string
  description: string
  excerpt: string
  category: string
  section_id: AdviceIdeasSectionId
  author_name: string | null
  author_role: string | null
  author_avatar_url: string | null
  read_time: number
  featured: boolean
  published: boolean
  published_at: string | null
  hero_media_type: 'image' | 'video'
  hero_media_src: string
  hero_media_alt: string
  hero_media_poster: string | null
  body: AdviceIdeasBodySection[]
  seed_comments: AdviceIdeasSeedComment[]
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by_clerk_id: string | null
  created_at: string
  updated_at: string
}

export type AdviceSubmissionDraft = PostDraft

export function submissionToDraft(row: AdviceArticleSubmissionRow): AdviceSubmissionDraft {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    excerpt: row.excerpt,
    category: row.category,
    section_id: row.section_id,
    author_name: row.author_name ?? '',
    author_role: row.author_role ?? '',
    author_avatar_url: row.author_avatar_url ?? '',
    read_time: row.read_time,
    featured: row.featured,
    published: row.published,
    // Empty string = "not yet published"; the editor's date input renders blank.
    published_at: row.published_at ?? '',
    hero_media_type: row.hero_media_type,
    hero_media_src: row.hero_media_src,
    hero_media_alt: row.hero_media_alt,
    hero_media_poster: row.hero_media_poster ?? '',
    body: row.body ?? [],
    seed_comments: row.seed_comments ?? [],
  }
}

export function statusLabel(status: AdviceSubmissionStatus): string {
  switch (status) {
    case 'draft':
      return 'Draft'
    case 'submitted':
      return 'Submitted'
    case 'changes_requested':
      return 'Changes requested'
    case 'approved':
      return 'Approved'
    case 'rejected':
      return 'Rejected'
    case 'published':
      return 'Published'
  }
}

export function statusTone(status: AdviceSubmissionStatus): string {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-700'
    case 'submitted':
      return 'bg-amber-50 text-amber-800'
    case 'changes_requested':
      return 'bg-rose-50 text-rose-700'
    case 'approved':
      return 'bg-emerald-50 text-emerald-700'
    case 'published':
      return 'bg-[#F0DFF6] text-[#7E5896]'
    case 'rejected':
      return 'bg-gray-100 text-gray-500'
  }
}
