import { notFound } from 'next/navigation'
import { createSupabaseAdminClient } from '@/lib/supabase'
import {
  sectionIdForCategory as canonicalSectionIdForCategory,
  slugify,
  type AdviceIdeasBodySection,
} from '@/lib/cms/advice-ideas'
import {
  type ContributorDraft,
  type ContributorSubmissionStatus,
  isEditableContributorStatus,
} from './types'
import { countBodyWords } from './bodyMetrics'
import { ownsDraft, requireContributorIdentity } from './auth'
import { getContributorProfileByEmail } from './profile'

type SubmissionRow = {
  id: string
  author_email: string
  author_clerk_id: string | null
  author_name?: string | null
  author_role?: string | null
  author_avatar_url?: string | null
  status: ContributorSubmissionStatus
  title: string
  description?: string | null
  excerpt?: string | null
  summary?: string | null
  category: string
  cover_image_url?: string | null
  cover_image_alt?: string | null
  hero_media_src?: string | null
  hero_media_alt?: string | null
  body: AdviceIdeasBodySection[] | null
  word_count?: number | null
  submitted_at: string | null
  reviewed_at: string | null
  correction_notes?: string | null
  admin_notes?: string | null
  review_notes?: string | null
  source_post_id: string | null
  slug: string
  created_at: string
  updated_at: string
}

export function normalizeCategory(value: string | null | undefined): string {
  const category = (value || '').trim()
  if (!category) return 'Planning Guides'
  // Accept any canonical category. Legacy values (e.g. "Style", "Vendors",
  // "Advice & Ideas" from before the navbar refresh) are preserved as-is so
  // existing drafts don't silently lose their category — the editor surfaces
  // them with a "(legacy)" suffix until the contributor re-picks one.
  return category
}

// Section-id mapping for legacy categories that aren't in the canonical
// navbar list (Style → themes-styles, Etiquette → etiquette-wording, etc.).
// Anything else falls back to the canonical mapping or planning-guides.
function sectionIdForCategory(category: string): string {
  switch (category) {
    case 'Style':
      return 'themes-styles'
    case 'Etiquette':
      return 'etiquette-wording'
    case 'Advice & Ideas':
      return 'featured-stories'
    case 'Vendors':
      return 'planning-guides'
  }
  return canonicalSectionIdForCategory(category) ?? 'planning-guides'
}

export function rowToContributorDraft(row: SubmissionRow): ContributorDraft {
  const body = Array.isArray(row.body) ? row.body : []
  const summary = row.summary ?? row.excerpt ?? row.description ?? ''
  const authorName = row.author_name?.trim() || row.author_email.split('@')[0] || ''
  return {
    id: row.id,
    author_email: row.author_email,
    author_clerk_id: row.author_clerk_id,
    status: row.status,
    title: row.title ?? '',
    summary,
    category: normalizeCategory(row.category),
    author_name: authorName,
    author_role: row.author_role ?? '',
    author_avatar_url: row.author_avatar_url ?? '',
    author_bio: '',
    author_initials: initialsFromName(authorName),
    cover_image_url: row.cover_image_url ?? row.hero_media_src ?? '',
    cover_image_alt: row.cover_image_alt ?? row.hero_media_alt ?? '',
    body,
    word_count: row.word_count ?? countBodyWords(body),
    submitted_at: row.submitted_at,
    reviewed_at: row.reviewed_at,
    review_notes: row.review_notes ?? row.correction_notes ?? row.admin_notes ?? null,
    source_post_id: row.source_post_id,
    slug: row.slug,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }
}

export async function withContributorProfile(
  draft: ContributorDraft
): Promise<ContributorDraft> {
  const profile = await getContributorProfileByEmail(draft.author_email)
  if (!profile) return draft
  const authorName = profile.name?.trim() || draft.author_name
  return {
    ...draft,
    author_name: authorName,
    author_role: profile.role ?? draft.author_role,
    author_avatar_url: profile.avatar_url ?? draft.author_avatar_url,
    author_bio: profile.bio ?? '',
    author_initials: profile.initials || initialsFromName(authorName),
  }
}

export async function defaultCategoryForUser(
  author: { clerkId: string; email: string }
): Promise<string> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('category')
    .or(`author_clerk_id.eq.${author.clerkId},author_email.ilike.${author.email}`)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ category: string | null }>()

  if (error) throw error
  return normalizeCategory(data?.category)
}

export async function loadOwnedContributorDraft(id: string): Promise<ContributorDraft> {
  const identity = await requireContributorIdentity()
  const draft = await findOwnedContributorDraft(id, identity)
  if (!draft) notFound()
  return draft
}

export async function findOwnedContributorDraft(
  id: string,
  identity: { clerkId: string; email: string }
): Promise<ContributorDraft | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<SubmissionRow>()

  if (error) throw error
  if (!data || !ownsDraft(data, identity)) return null
  return withContributorProfile(rowToContributorDraft(data))
}

export function contributorPatchPayload(input: Partial<ContributorDraft>): Record<string, unknown> {
  const payload: Record<string, unknown> = {}
  if (input.title !== undefined) {
    payload.title = input.title
    payload.slug = input.title.trim() ? slugify(input.title) : ''
  }
  if (input.summary !== undefined) {
    payload.summary = input.summary
    payload.description = input.summary
    payload.excerpt = input.summary
  }
  if (input.category !== undefined) {
    const category = normalizeCategory(input.category)
    payload.category = category
    payload.section_id = sectionIdForCategory(category)
  }
  if (input.cover_image_url !== undefined) {
    payload.cover_image_url = input.cover_image_url
    payload.hero_media_src = input.cover_image_url
    payload.hero_media_type = 'image'
  }
  if (input.cover_image_alt !== undefined) {
    payload.cover_image_alt = input.cover_image_alt
    payload.hero_media_alt = input.cover_image_alt
  }
  if (input.author_name !== undefined) payload.author_name = input.author_name || null
  if (input.author_role !== undefined) payload.author_role = input.author_role || null
  if (input.author_avatar_url !== undefined) {
    payload.author_avatar_url = input.author_avatar_url || null
  }
  if (input.body !== undefined) {
    payload.body = input.body
    payload.word_count = input.word_count ?? countBodyWords(input.body)
    payload.read_time = Math.max(1, Math.ceil((payload.word_count as number) / 200))
  } else if (input.word_count !== undefined) {
    payload.word_count = input.word_count
    payload.read_time = Math.max(1, Math.ceil(input.word_count / 200))
  }
  return payload
}

function initialsFromName(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 3)
}

export async function assertOwnedEditableDraft(id: string): Promise<ContributorDraft> {
  const draft = await loadOwnedContributorDraft(id)
  if (!isEditableContributorStatus(draft.status)) {
    throw new Error('This draft is locked while it is being reviewed.')
  }
  return draft
}
