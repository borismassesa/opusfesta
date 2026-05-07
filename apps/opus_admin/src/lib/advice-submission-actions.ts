'use server'

import { randomBytes, randomUUID } from 'crypto'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { revalidateWebsite as revalidateWebsitePaths } from '@/lib/revalidate'
import { auth, currentUser } from '@clerk/nextjs/server'
import { requireAdminRole, type AdminAccessRole } from '@/lib/admin-auth'
import { createSupabaseAdminClient } from '@/lib/supabase'
import { slugify, type AdviceIdeasPostRow } from '@/lib/cms/advice-ideas'
import {
  acceptContributorInvitationByToken,
  acceptLatestPendingInvitationForIdentity,
  hashContributorInviteToken,
  normalizeContributorEmail,
} from '@/lib/contribute/invitations'
import {
  type AdviceArticleInvitationRow,
  type AdviceArticleSubmissionRow,
  type AdviceSubmissionDraft,
} from '@/lib/advice-submissions'
import { getResendConfigError, isEmailConfigured, sendEmail } from '@/lib/email'
import { buildContributorInviteEmail } from '@/lib/contributor-invite-email'

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

export type ContributorInvitationDelivery =
  | { sent: true; via: 'resend' }
  | { sent: false; reason: 'not_configured' | 'send_failed'; error?: string }

export type ContributorInvitationResult = {
  id: string
  link: string
  expiresAt: string
  recipient: { email: string; fullName: string | null; articleTitle: string | null }
  delivery: ContributorInvitationDelivery
}

function normalizeEmail(email: string): string {
  return normalizeContributorEmail(email)
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
    published_at: input.published_at || new Date().toISOString(),
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
    published_at: input.published_at || new Date().toISOString(),
  }
}

async function revalidateWebsite(slug?: string): Promise<void> {
  const paths = ['/advice-and-ideas']
  if (slug) paths.push(`/advice-and-ideas/${slug}`)
  await revalidateWebsitePaths(...paths)
}

async function getOrigin(): Promise<string> {
  // Prefer the explicitly-configured URL so invite emails always carry a
  // reachable link (localhost is unreachable to external recipients). Fall
  // back to the request origin/host for in-app self-references when no env
  // override is set.
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim() || process.env.NEXT_PUBLIC_ADMIN_URL?.trim()
  if (configured) return configured.replace(/\/$/, '')

  const h = await headers()
  const origin = h.get('origin')
  if (origin) return origin
  const host = h.get('host')
  const proto = h.get('x-forwarded-proto') || 'http'
  if (host) return `${proto}://${host}`
  return 'http://localhost:3010'
}

async function dispatchInviteEmail(args: {
  email: string
  fullName: string | null
  articleTitle: string | null
  link: string
  expiresAt: string
}): Promise<ContributorInvitationDelivery> {
  if (!isEmailConfigured()) {
    return {
      sent: false,
      reason: 'not_configured',
      error: getResendConfigError()?.message,
    }
  }
  const template = buildContributorInviteEmail({
    recipientEmail: args.email,
    recipientName: args.fullName,
    articleTitle: args.articleTitle,
    inviteLink: args.link,
    expiresAt: args.expiresAt,
  })
  const result = await sendEmail({
    to: args.email,
    subject: template.subject,
    html: template.html,
    text: template.text,
  })
  if (result.sent) return { sent: true, via: 'resend' }
  return { sent: false, reason: result.reason, error: result.error }
}

export async function createContributorInvitation(
  input: ContributorInvitationInput
): Promise<ContributorInvitationResult> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)

  const email = normalizeEmail(input.email)
  if (!email || !email.includes('@')) throw new Error('A valid email is required.')

  const fullName = input.fullName?.trim() || null
  const articleTitle = input.articleTitle?.trim() || null
  const days = Math.min(90, Math.max(1, Math.round(input.expiresInDays ?? 14)))
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const token = randomBytes(32).toString('base64url')
  const identity = await getIdentity()

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .insert({
      email,
      full_name: fullName,
      article_title: articleTitle,
      token_hash: hashContributorInviteToken(token),
      status: 'pending',
      expires_at: expiresAt,
      created_by_clerk_id: identity.clerkId,
    })
    .select('id, expires_at')
    .single<{ id: string; expires_at: string }>()

  if (error) throw error

  const origin = await getOrigin()
  const link = `${origin}/contribute/invite/${token}`
  const delivery = await dispatchInviteEmail({
    email,
    fullName,
    articleTitle,
    link,
    expiresAt: data.expires_at,
  })

  revalidatePath('/operations/authors')
  return {
    id: data.id,
    link,
    expiresAt: data.expires_at,
    recipient: { email, fullName, articleTitle },
    delivery,
  }
}

// Rotates the invite token so a fresh link can be re-sent if the previous one
// was lost or expired. The old link stops working the moment we update
// token_hash, which is what we want — the email is the only durable record.
export async function regenerateContributorInvitation(
  id: string,
  expiresInDays = 14
): Promise<ContributorInvitationResult> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)

  const days = Math.min(90, Math.max(1, Math.round(expiresInDays)))
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const token = randomBytes(32).toString('base64url')

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .update({
      token_hash: hashContributorInviteToken(token),
      status: 'pending',
      expires_at: expiresAt,
    })
    .eq('id', id)
    .select('id, email, full_name, article_title, expires_at')
    .single<{
      id: string
      email: string
      full_name: string | null
      article_title: string | null
      expires_at: string
    }>()

  if (error) throw error

  const origin = await getOrigin()
  const link = `${origin}/contribute/invite/${token}`
  const delivery = await dispatchInviteEmail({
    email: data.email,
    fullName: data.full_name,
    articleTitle: data.article_title,
    link,
    expiresAt: data.expires_at,
  })

  revalidatePath('/operations/authors')
  return {
    id: data.id,
    link,
    expiresAt: data.expires_at,
    recipient: {
      email: data.email,
      fullName: data.full_name,
      articleTitle: data.article_title,
    },
    delivery,
  }
}

// Rotates token_hash so the previously-shared link is invalidated — invite
// tokens are bearer credentials, so issuing a "fresh link" must immediately
// retire the old one. Status guard prevents silently reviving a revoked or
// already-accepted invite from a stale UI.
export async function regenerateContributorInvitationLink(
  id: string,
  expiresInDays = 14
): Promise<{ id: string; link: string; expiresAt: string; email: string }> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)

  const days = Math.min(90, Math.max(1, Math.round(expiresInDays)))
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
  const token = randomBytes(32).toString('base64url')

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .update({
      token_hash: hashContributorInviteToken(token),
      expires_at: expiresAt,
    })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id, email, expires_at')
    .maybeSingle<{ id: string; email: string; expires_at: string }>()

  if (error) throw error
  if (!data) {
    throw new Error('Invite is no longer pending. Reload the page to see its current state.')
  }

  const origin = await getOrigin()
  const link = `${origin}/contribute/invite/${token}`

  revalidatePath('/operations/authors')
  return { id: data.id, link, expiresAt: data.expires_at, email: data.email }
}

// Soft-cancel: marks a *pending* invite revoked so the link stops working but
// the audit row sticks around. Status guard prevents revoking an invite that
// was accepted in another tab — that would leave the row inconsistent
// (revoked status with accepted_clerk_id + accepted_submission_id populated).
export async function revokeContributorInvitation(id: string): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .update({ status: 'revoked' })
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) {
    throw new Error('Invite is no longer pending — it may have been accepted or already revoked.')
  }
  revalidatePath('/operations/authors')
}

export type ContributorInvitationUpdate = {
  fullName?: string | null
  articleTitle?: string | null
}

export async function updateContributorInvitation(
  id: string,
  update: ContributorInvitationUpdate
): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const payload: Record<string, unknown> = {}
  if (update.fullName !== undefined) {
    const v = update.fullName?.trim() ?? ''
    payload.full_name = v || null
  }
  if (update.articleTitle !== undefined) {
    const v = update.articleTitle?.trim() ?? ''
    payload.article_title = v || null
  }
  if (Object.keys(payload).length === 0) return

  const supabase = createSupabaseAdminClient()
  const { data, error } = await supabase
    .from('advice_article_invitations')
    .update(payload)
    .eq('id', id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle()
  if (error) throw error
  if (!data) {
    throw new Error('Invite is no longer pending — its details cannot be edited.')
  }
  revalidatePath('/operations/authors')
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
    .eq('token_hash', hashContributorInviteToken(token))
    .maybeSingle()

  if (error) throw error
  return data
}

export async function acceptContributorInvitation(token: string): Promise<{ id: string }> {
  const identity = await getIdentity()
  const result = await acceptContributorInvitationByToken(token, identity)
  revalidateContributorRoutes()
  return result
}

export async function acceptPendingContributorInvitationForCurrentUser(): Promise<{ id: string } | null> {
  const identity = await getIdentity()
  const result = await acceptLatestPendingInvitationForIdentity(identity)
  if (result) revalidateContributorRoutes()
  return result
}

function revalidateContributorRoutes(): void {
  revalidatePath('/contribute')
  revalidatePath('/contribute/articles')
  revalidatePath('/operations/articles/submissions')
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

  await loadOwnedSubmission(submissionId, true)

  const supabase = createSupabaseAdminClient()
  const ext = file.name.split('.').pop() ?? 'bin'
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
    published_at: submission.published_at ?? '',
    hero_media_type: submission.hero_media_type,
    hero_media_src: submission.hero_media_src,
    hero_media_alt: submission.hero_media_alt,
    hero_media_poster: submission.hero_media_poster ?? '',
    body: submission.body,
    seed_comments: submission.seed_comments,
  } satisfies AdviceSubmissionDraft

  const slug = (draft.slug || slugify(draft.title)).trim()
  if (!slug) throw new Error('Slug is required before approval.')

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
      reviewed_at: new Date().toISOString(),
      reviewed_by_clerk_id: identity.clerkId,
      correction_notes: null,
    })
    .eq('id', id)
  if (updateError) throw updateError

  revalidatePath('/operations/articles')
  revalidatePath('/operations/articles/submissions')
  revalidatePath(`/operations/articles/submissions/${id}`)
  await revalidateWebsite(slug)
  return { postId }
}

export async function deleteAdviceSubmission(id: string): Promise<void> {
  await requireAdminRole(ARTICLE_MANAGE_ROLES)
  const supabase = createSupabaseAdminClient()
  const { error } = await supabase.from('advice_article_submissions').delete().eq('id', id)
  if (error) throw error
  revalidatePath('/operations/articles/submissions')
}
