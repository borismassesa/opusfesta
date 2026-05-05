'use server'

import { createHash, randomBytes, randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { auth, currentUser } from '@clerk/nextjs/server'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { slugify, type AdviceIdeasPostRow } from '@/lib/cms/advice-ideas'
import {
  type AdviceArticleInvitationRow,
  type AdviceArticleSubmissionRow,
  type AdviceSubmissionDraft,
} from '@/lib/advice-submissions'

const ARTICLE_MANAGE_ROLES: AdminAccessRole[] = ['owner', 'admin', 'editor']

type Identity = {
  clerkId: string
  email: string
  name: string | null
}

export type ContributorInvitationInput = {
  email: string
  fullName?: string
  articleTitle?: string
  expiresInDays?: number
}

export type ContributorInvitationResult = {
  id: string
  link: string
  expiresAt: string
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

async function getIdentity(): Promise<Identity> {
  const { userId } = await auth()
  if (!userId) throw new Error('Sign in first.')

  const user = await currentUser()
  const email = normalizeEmail(
    user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress ||
      ''
  )
  if (!email) throw new Error('Your account needs an email address.')

  const name =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    null

  return { clerkId: userId, email, name }
}

// Cap and allowlist for contributor uploads — mirrors the public website-media bucket policy.
const CONTRIBUTOR_UPLOAD_MAX_BYTES = 25 * 1024 * 1024
const CONTRIBUTOR_UPLOAD_ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
])
const CONTRIBUTOR_UPLOAD_ALLOWED_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'mp4', 'webm'])

function draftPayload(input: AdviceSubmissionDraft): Record<string, unknown> {
  return {
    slug: (input.slug || slugify(input.title)).trim(),
    title: input.title,
    description: input.description,
    excerpt: input.excerpt,
    category: input.category,
    section_id: input.section_id,
    author_name: input.author_name || null,
    author_role: input.author_role || null,
    author_avatar_url: input.author_avatar_url || null,
    read_time: Math.max(1, Math.round(input.read_time || 1)),
    featured: !!input.featured,
    published: !!input.published,
    published_at: input.published_at || null,
    hero_media_type: input.hero_media_type,
    hero_media_src: input.hero_media_src,
    hero_media_alt: input.hero_media_alt,
    hero_media_poster: input.hero_media_poster || null,
    body: input.body,
    seed_comments: input.seed_comments,
  }
}

function postPayload(input: AdviceSubmissionDraft, publish: boolean): Record<string, unknown> {
  return {
    ...draftPayload(input),
    published: publish,
    // For posts the column is NOT NULL — use input timestamp if provided, else now().
    published_at: input.published_at || new Date().toISOString(),
  }
}

async function revalidateWebsite(slug?: string): Promise<{ ok: boolean; failures: string[] }> {
  const url = process.env.NEXT_PUBLIC_WEBSITE_URL
  const secret = process.env.WEBSITE_REVALIDATE_SECRET
  if (!url || !secret) return { ok: true, failures: [] }
  const paths = ['/advice-and-ideas']
  if (slug) paths.push(`/advice-and-ideas/${slug}`)
  const failures: string[] = []
  await Promise.all(
    paths.map(async (path) => {
      try {
        const res = await fetch(`${url}/api/revalidate?path=${encodeURIComponent(path)}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${secret}` },
        })
        if (!res.ok) {
          failures.push(`${path} -> HTTP ${res.status}`)
          console.error('[advice.revalidate] non-ok response', { path, status: res.status })
        }
      } catch (err) {
        failures.push(`${path} -> ${err instanceof Error ? err.message : 'fetch error'}`)
        console.error('[advice.revalidate] threw', { path, err })
      }
    })
  )
  return { ok: failures.length === 0, failures }
}

async function getOrigin(): Promise<string> {
  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') || 'http'
  if (host) return `${proto}://${host}`
  const fallback = process.env.NEXT_PUBLIC_ADMIN_URL
  if (fallback) return fallback
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'Could not resolve admin origin: missing host header and NEXT_PUBLIC_ADMIN_URL.'
    )
  }
  return 'http://localhost:3010'
}

export async function createContributorInvitation(
  input: ContributorInvitationInput
): Promise<ContributorInvitationResult> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)

  const email = normalizeEmail(input.email)
  if (!email || !email.includes('@')) throw new Error('A valid email is required.')

  const days = Math.min(90, Math.max(1, Math.round(input.expiresInDays ?? 14)))
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const token = randomBytes(32).toString('base64url')
  const identity = await getIdentity()

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .insert({
      email,
      full_name: input.fullName?.trim() || null,
      article_title: input.articleTitle?.trim() || null,
      token_hash: hashToken(token),
      status: 'pending',
      expires_at: expiresAt,
      created_by_clerk_id: identity.clerkId,
    })
    .select('id, expires_at')
    .single<{ id: string; expires_at: string }>()

  if (error) throw error

  const origin = await getOrigin()
  revalidatePath('/operations/authors')
  return {
    id: data.id,
    link: `${origin}/contribute/invite/${token}`,
    expiresAt: data.expires_at,
  }
}

export async function getInvitationPreview(
  token: string
): Promise<Pick<
  AdviceArticleInvitationRow,
  'id' | 'email' | 'full_name' | 'article_title' | 'status' | 'expires_at' | 'accepted_submission_id'
> | null> {
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .select('id, email, full_name, article_title, status, expires_at, accepted_submission_id')
    .eq('token_hash', hashToken(token))
    .maybeSingle()

  if (error) throw error
  return data
}

export async function acceptContributorInvitation(token: string): Promise<{ id: string }> {
  const identity = await getIdentity()
  const supabase = createSupabaseAdminClient()
  const { data: invite, error } = await supabase
    .from('advice_article_invitations')
    .select('*')
    .eq('token_hash', hashToken(token))
    .maybeSingle<AdviceArticleInvitationRow>()

  if (error) throw error
  if (!invite) throw new Error('This contributor invitation is invalid.')

  const inviteEmail = normalizeEmail(invite.email)
  if (inviteEmail !== identity.email) {
    throw new Error(`This invite is for ${invite.email}. Sign in with that email to accept it.`)
  }

  if (invite.status === 'revoked') throw new Error('This invite has been revoked.')
  if (new Date(invite.expires_at).getTime() < Date.now()) {
    await supabase
      .from('advice_article_invitations')
      .update({ status: 'expired' })
      .eq('id', invite.id)
    throw new Error('This invite has expired.')
  }

  if (invite.accepted_submission_id) {
    return { id: invite.accepted_submission_id }
  }

  if (invite.status !== 'pending') {
    throw new Error('This invite is no longer accepting drafts.')
  }

  const title = invite.article_title ?? ''
  const { data: submission, error: insertError } = await supabase
    .from('advice_article_submissions')
    .insert({
      invitation_id: invite.id,
      author_email: identity.email,
      author_clerk_id: identity.clerkId,
      status: 'draft',
      title,
      slug: title ? slugify(title) : '',
      author_name: invite.full_name || identity.name || identity.email.split('@')[0],
      published: false,
    })
    .select('id')
    .single<{ id: string }>()

  if (insertError) {
    // 23505 is the Postgres unique-violation code — fires when a concurrent
    // request beat us to the UNIQUE(invitation_id) constraint on submissions.
    // Re-read the invite and return the now-existing submission id.
    if ((insertError as { code?: string }).code === '23505') {
      const { data: existing } = await supabase
        .from('advice_article_submissions')
        .select('id')
        .eq('invitation_id', invite.id)
        .maybeSingle<{ id: string }>()
      if (existing) {
        revalidatePath('/contribute/articles')
        return { id: existing.id }
      }
    }
    throw insertError
  }

  const { error: updateError } = await supabase
    .from('advice_article_invitations')
    .update({
      status: 'accepted',
      accepted_clerk_id: identity.clerkId,
      accepted_submission_id: submission.id,
      accepted_at: new Date().toISOString(),
    })
    .eq('id', invite.id)

  if (updateError) {
    console.error('[advice.accept] submission inserted but invite update failed', {
      invitationId: invite.id,
      submissionId: submission.id,
      err: updateError,
    })
    throw updateError
  }

  revalidatePath('/contribute/articles')
  revalidatePath('/operations/articles/submissions')
  return { id: submission.id }
}

async function loadOwnedSubmission(
  id: string,
  editableOnly = false
): Promise<AdviceArticleSubmissionRow> {
  const identity = await getIdentity()
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceArticleSubmissionRow>()

  if (error) throw error
  if (!data) throw new Error('Submission not found.')
  if (
    data.author_clerk_id !== identity.clerkId &&
    normalizeEmail(data.author_email) !== identity.email
  ) {
    throw new Error('You can only access your own submissions.')
  }
  if (editableOnly && !['draft', 'changes_requested'].includes(data.status)) {
    throw new Error('This submission is locked while the editorial team reviews it.')
  }
  return data
}

export async function saveContributorSubmission(
  id: string,
  input: AdviceSubmissionDraft
): Promise<void> {
  await loadOwnedSubmission(id, true)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('advice_article_submissions')
    .update({
      ...draftPayload(input),
      published: false,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/contribute/articles')
  revalidatePath(`/contribute/articles/${id}`)
  revalidatePath('/operations/articles/submissions')
}

export async function submitContributorSubmission(
  id: string,
  input: AdviceSubmissionDraft
): Promise<void> {
  await loadOwnedSubmission(id, true)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('advice_article_submissions')
    .update({
      ...draftPayload(input),
      published: false,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      correction_notes: null,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/contribute/articles')
  revalidatePath(`/contribute/articles/${id}`)
  revalidatePath('/operations/articles/submissions')
}

export async function uploadContributorMedia(
  formData: FormData
): Promise<{ url: string; type: 'image' | 'video' }> {
  const file = formData.get('file') as File | null
  const submissionId = (formData.get('submissionId') as string | null) ?? ''
  if (!file) throw new Error('No file provided.')
  if (!submissionId) throw new Error('Missing submission.')

  if (file.size > CONTRIBUTOR_UPLOAD_MAX_BYTES) {
    throw new Error('File is too large. The contributor upload limit is 25 MB.')
  }
  if (!CONTRIBUTOR_UPLOAD_ALLOWED_MIME.has(file.type)) {
    throw new Error(
      'Unsupported file type. Allowed: PNG, JPEG, WebP, GIF, MP4, WebM.'
    )
  }
  const rawExt = (file.name.split('.').pop() ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')
  const ext = CONTRIBUTOR_UPLOAD_ALLOWED_EXT.has(rawExt)
    ? rawExt
    : file.type.startsWith('video')
      ? 'mp4'
      : 'png'

  await loadOwnedSubmission(submissionId, true)

  const supabase = createSupabaseAdminClient()
  const path = `advice-and-ideas/submissions/${submissionId}/${Date.now()}-${randomUUID()}.${ext}`

  const { error } = await supabase.storage
    .from('website-media')
    .upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw error

  const { data } = supabase.storage.from('website-media').getPublicUrl(path)
  return {
    url: data.publicUrl,
    type: file.type.startsWith('video') ? 'video' : 'image',
  }
}

export async function updateAdviceSubmissionAsAdmin(
  id: string,
  input: AdviceSubmissionDraft
): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('advice_article_submissions')
    .update(draftPayload(input))
    .eq('id', id)

  if (error) throw error
  revalidatePath('/operations/articles/submissions')
  revalidatePath(`/operations/articles/submissions/${id}`)
}

export async function requestAdviceSubmissionCorrections(
  id: string,
  notes: string
): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  if (!notes.trim()) throw new Error('Correction notes are required.')

  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('advice_article_submissions')
    .update({
      status: 'changes_requested',
      correction_notes: notes.trim(),
      reviewed_at: new Date().toISOString(),
      reviewed_by_clerk_id: (await getIdentity()).clerkId,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/operations/articles/submissions')
  revalidatePath(`/operations/articles/submissions/${id}`)
}

export async function rejectAdviceSubmission(
  id: string,
  notes: string
): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase
    .from('advice_article_submissions')
    .update({
      status: 'rejected',
      admin_notes: notes.trim() || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by_clerk_id: (await getIdentity()).clerkId,
    })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/operations/articles/submissions')
  revalidatePath(`/operations/articles/submissions/${id}`)
}

export async function approveAdviceSubmission(
  id: string,
  publish: boolean
): Promise<{ postId: string; revalidationFailures?: string[] }> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const identity = await getIdentity()
  const supabase = createSupabaseAdminClient()
  const { data: submission, error: loadError } = await supabase
    .from('advice_article_submissions')
    .select('*')
    .eq('id', id)
    .maybeSingle<AdviceArticleSubmissionRow>()

  if (loadError) throw loadError
  if (!submission) throw new Error('Submission not found.')

  // Slug uniqueness is enforced at the DB layer on advice_ideas_posts. Pre-check
  // so the admin gets a friendly error instead of a raw Postgres unique violation
  // when a contributor's auto-slugified title collides with a published article.
  const slug = (submission.slug || slugify(submission.title)).trim()
  if (!slug) throw new Error('Slug is required before approval.')
  if (!submission.source_post_id) {
    const { data: collision } = await supabase
      .from('advice_ideas_posts')
      .select('id')
      .eq('slug', slug)
      .maybeSingle<{ id: string }>()
    if (collision) {
      throw new Error(
        `Slug "${slug}" is already used by another article. Edit the slug on this submission before approving.`
      )
    }
  }

  // First publish: stamp published_at to now. Subsequent re-publishes preserve
  // the original publication date so SEO and feed ordering stay stable.
  const isFirstPublish = publish && !submission.source_post_id
  const publishedAt = isFirstPublish
    ? new Date().toISOString()
    : submission.published_at ?? new Date().toISOString()

  const draft = {
    slug: submission.slug,
    title: submission.title,
    description: submission.description,
    excerpt: submission.excerpt,
    category: submission.category,
    section_id: submission.section_id,
    author_name: submission.author_name ?? '',
    author_role: submission.author_role ?? '',
    author_avatar_url: submission.author_avatar_url ?? '',
    read_time: submission.read_time,
    featured: submission.featured,
    published: publish,
    published_at: publishedAt,
    hero_media_type: submission.hero_media_type,
    hero_media_src: submission.hero_media_src,
    hero_media_alt: submission.hero_media_alt,
    hero_media_poster: submission.hero_media_poster ?? '',
    body: submission.body,
    seed_comments: submission.seed_comments,
  } satisfies AdviceSubmissionDraft

  let postId = submission.source_post_id
  if (postId) {
    const { error } = await supabase
      .from('advice_ideas_posts')
      .update({ ...postPayload({ ...draft, slug }, publish), slug })
      .eq('id', postId)
    if (error) throw error
  } else {
    const { data, error } = await supabase
      .from('advice_ideas_posts')
      .insert({ ...postPayload({ ...draft, slug }, publish), slug })
      .select('id')
      .single<Pick<AdviceIdeasPostRow, 'id'>>()
    if (error) throw error
    postId = data.id
  }

  const { error: updateError } = await supabase
    .from('advice_article_submissions')
    .update({
      source_post_id: postId,
      status: publish ? 'published' : 'approved',
      published: publish,
      published_at: publishedAt,
      reviewed_at: new Date().toISOString(),
      reviewed_by_clerk_id: identity.clerkId,
      correction_notes: null,
    })
    .eq('id', id)
  if (updateError) {
    // The post is already created/updated — log the orphan so it can be reconciled.
    console.error('[advice.approve] post written but submission update failed', {
      submissionId: id,
      postId,
      err: updateError,
    })
    throw updateError
  }

  revalidatePath('/operations/articles')
  revalidatePath('/operations/articles/submissions')
  revalidatePath(`/operations/articles/submissions/${id}`)
  const revalidation = await revalidateWebsite(slug)
  return {
    postId,
    revalidationFailures: revalidation.ok ? undefined : revalidation.failures,
  }
}

export async function deleteAdviceSubmission(id: string): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('advice_article_submissions').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/operations/articles/submissions')
}
